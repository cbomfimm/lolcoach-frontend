import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body?.email;
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || 'no-reply@mindriftai.com';

    let transporter;
    if (smtpHost && smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort || 587,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });
    } else {
      // Fallback to jsonTransport in dev if SMTP not configured (no real email will be sent)
      transporter = nodemailer.createTransport({ jsonTransport: true });
      console.warn('SMTP não configurado. Usando jsonTransport — nenhum email real será enviado. Configure SMTP_HOST/SMTP_USER/SMTP_PASS.');
    }

    const info = await transporter.sendMail({
      from,
      to: 'suporte.mindriftai@gmail.com',
      subject: 'Novo pedido de acesso antecipado',
      text: `O usuário com e-mail ${email} solicitou acesso antecipado.`,
      html: `<p>O usuário com e-mail <strong>${email}</strong> solicitou acesso antecipado.</p>`,
      replyTo: email,
    });

    console.log('send-email info:', info);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Erro no send-email:', err);
    return NextResponse.json({ error: 'Erro ao enviar email' }, { status: 500 });
  }
}
