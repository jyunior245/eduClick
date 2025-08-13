import { Request, Response } from 'express';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Lazy getter to avoid crashing server when STRIPE_SECRET_KEY is absent in development
const getStripe = (): Stripe => {
  if (!stripeSecret) {
    throw new Error('Stripe não configurado: defina STRIPE_SECRET_KEY no .env');
  }
  return new Stripe(stripeSecret);
};

export class PagamentoController {
  // POST /api/pagamentos/criar-intencao
  // body: { amount: number (centavos), aulaId: string, professorId?: string, reservaId?: string, descricao?: string }
  static async criarIntencao(req: Request, res: Response) {
    try {
      const stripe = getStripe();
      const { amount, aulaId, professorId, reservaId, descricao } = req.body || {};
      if (!amount || !aulaId) {
        return res.status(400).json({ error: 'Parâmetros obrigatórios ausentes: amount, aulaId' });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Number(amount),
        currency: 'brl',
        payment_method_types: ['pix'],
        description: descricao || 'Pagamento de aula',
        metadata: {
          aulaId: String(aulaId),
          professorId: professorId ? String(professorId) : '',
          reservaId: reservaId ? String(reservaId) : ''
        }
      });

      // Para Pix, Stripe retorna next_action.pix_display_qr_code
      const qr = (paymentIntent.next_action as any)?.pix_display_qr_code || null;

      return res.status(201).json({
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
        pix: qr ? {
          qr_code: qr.data || null,
          image_url_png: qr.image_url_png || null,
          image_url_svg: qr.image_url_svg || null,
          expires_at: qr.expires_at || null
        } : null
      });
    } catch (err: any) {
      console.error('[Stripe] criar-intencao erro:', err?.message || err);
      return res.status(500).json({ error: 'Falha ao criar PaymentIntent Pix' });
    }
  }

  // POST /api/pagamentos/stripe/onboarding-link
  // Cria uma connected account (Express) e gera um account link para o professor completar o KYC
  static async criarOnboardingLink(req: Request, res: Response) {
    try {
      const stripe = getStripe();
      // Em produção, obtenha professor logado da sessão e recupere/salve stripeAccountId no BD.
      // Aqui, para MVP, sempre cria uma nova conta (seu próximo passo é persistir stripeAccountId em Professor).

      const account = await stripe.accounts.create({
        type: 'express',
        country: 'BR',
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true }
        }
      });

      const returnUrl = 'http://localhost:1234/?onboarding=success';
      const refreshUrl = 'http://localhost:1234/?onboarding=refresh';

      const link = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding'
      });

      // TODO: salvar account.id em Professor.stripeAccountId

      return res.status(201).json({ accountId: account.id, onboardingUrl: link.url });
    } catch (err: any) {
      console.error('[Stripe] onboarding erro:', err?.message || err);
      return res.status(500).json({ error: 'Falha ao gerar onboarding link' });
    }
  }

  // POST /api/stripe/webhook (montado com body raw no index.ts)
  static async webhook(req: Request, res: Response) {
    try {
      const sig = req.headers['stripe-signature'];
      if (!sig || typeof sig !== 'string') {
        return res.status(400).send('Missing stripe-signature');
      }
      // bodyParser.raw sets req.body to a Buffer
      const buf = req.body as unknown as Buffer;
      let event: Stripe.Event;

      try {
        if (!webhookSecret) {
          console.error('[Stripe] webhook secret ausente: configure STRIPE_WEBHOOK_SECRET');
          return res.status(500).send('Webhook não configurado');
        }
        // Use helper estático para validar a assinatura do webhook
        event = (Stripe as any).webhooks.constructEvent(buf, sig, webhookSecret);
      } catch (err: any) {
        console.error('[Stripe] webhook signature error:', err?.message || err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      switch (event.type) {
        case 'payment_intent.succeeded': {
          const pi = event.data.object as Stripe.PaymentIntent;
          console.log('[Stripe] payment_intent.succeeded', pi.id, pi.metadata);
          // TODO: marcar reserva como paga e confirmar vaga (usar pi.metadata.reservaId/aulaId)
          break;
        }
        case 'payment_intent.payment_failed': {
          const pi = event.data.object as Stripe.PaymentIntent;
          console.log('[Stripe] payment_intent.payment_failed', pi.id, pi.last_payment_error?.message);
          // TODO: marcar como falhou
          break;
        }
        case 'charge.refunded': {
          const charge = event.data.object as Stripe.Charge;
          console.log('[Stripe] charge.refunded', charge.id, charge.payment_intent);
          // TODO: marcar reserva como reembolsada e liberar vaga
          break;
        }
        default:
          console.log('[Stripe] evento ignorado:', event.type);
      }

      return res.json({ received: true });
    } catch (err: any) {
      console.error('[Stripe] webhook erro geral:', err?.message || err);
      return res.status(500).send('Webhook handler error');
    }
  }
}
