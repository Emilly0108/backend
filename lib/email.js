import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export async function enviarEmailRecuperacao(email, link) {
    try {
        console.log(">>> Tentando enviar e-mail...");
        console.log(">>> Remetente:", process.env.EMAIL_USER);
        console.log(">>> Destinatário:", email);

        const info = await transporter.sendMail({
            from: `"GeoConnect" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Redefinição de senha - GeoConnect",
            html: `
                <h2>Redefinição de senha</h2>

                <p>Você solicitou a redefinição da sua senha no GeoConnect.</p>

                <p>Clique no botão abaixo para criar uma nova senha:</p>

                <a href="${link}"
                   style="
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #0d6efd;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                   ">
                    Redefinir minha senha
                </a>

                <p>Esse link ficará disponível por 1 hora.</p>

                <p>Se você não solicitou essa alteração, ignore este e-mail.</p>
            `
        });

        console.log(">>> ✅ E-mail enviado!");
        console.log(">>> Message ID:", info.messageId);

        return info;

    } catch (error) {
        console.error(">>> ❌ ERRO AO ENVIAR E-MAIL:");
        console.error(error);

        throw error;
    }
}

export async function enviarEmailStatusMaterial(email, nomeProfessor, tituloMaterial, status, motivoRejeicao) {
    try {
        console.log(">>> Tentando enviar e-mail de status do material...");
        console.log(">>> Destinatário:", email);
        console.log(">>> Status:", status);

        const aprovado = status === 'aprovado';

        const assunto = aprovado
            ? "Seu material foi aprovado - GeoConnect"
            : "Seu material foi rejeitado - GeoConnect";

        const corDestaque = aprovado ? "#198754" : "#dc3545";

        const mensagemStatus = aprovado
            ? "foi aprovado e já está disponível na plataforma."
            : "foi rejeitado.";

        const info = await transporter.sendMail({
            from: `"GeoConnect" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: assunto,
            html: `
                <h2 style="color: ${corDestaque};">
                    Material ${aprovado ? "aprovado" : "rejeitado"}
                </h2>

                <p>Olá, ${nomeProfessor},</p>

                <p>Seu material <strong>"${tituloMaterial}"</strong> ${mensagemStatus}</p>

                ${
                    !aprovado && motivoRejeicao
                        ? `<p><strong>Motivo:</strong> ${motivoRejeicao}</p>`
                        : ""
                }

                <p>Você pode acessar a plataforma para mais detalhes.</p>
            `
        });

        console.log(">>> ✅ E-mail de status enviado!");
        console.log(">>> Message ID:", info.messageId);

        return info;

    } catch (error) {
        console.error(">>> ❌ ERRO AO ENVIAR E-MAIL DE STATUS:");
        console.error(error);

        throw error;
    }
}