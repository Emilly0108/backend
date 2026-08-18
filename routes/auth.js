import { prisma } from "../lib/prisma.ts"
import { OAuth2Client } from "google-auth-library"

console.log(">>> AUTH.JS FOI CARREGADO")


// =====================================================
// CONFIGURAÇÃO DO GOOGLE
// =====================================================

const GOOGLE_CLIENT_ID =
    "102302103057-v175sj9qktdd2p09qhfv0koaj9bkj0a3.apps.googleusercontent.com"

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)



export function auth(server) {

    // =================================================
    // LOGIN / CADASTRO COM GOOGLE
    // =================================================

    server.post('/login/google', async (request, reply) => {

        try {

            console.log("====================================")
            console.log(">>> ROTA /login/google")
            console.log("====================================")


            const { credential } = request.body || {}


            // -----------------------------------------
            // VERIFICA SE O CREDENTIAL FOI RECEBIDO
            // -----------------------------------------

            if (!credential) {

                console.log(
                    ">>> ❌ Credential do Google não recebido"
                )

                return reply.status(400).send({
                    error: "Credential do Google não foi informado"
                })
            }


            console.log(
                ">>> Credential recebido"
            )


            // -----------------------------------------
            // VERIFICA O TOKEN DO GOOGLE
            // -----------------------------------------

            const ticket = await googleClient.verifyIdToken({

                idToken: credential,

                audience: GOOGLE_CLIENT_ID

            })


            const payload = ticket.getPayload()


            if (!payload) {

                console.log(
                    ">>> ❌ Payload do Google não encontrado"
                )

                return reply.status(401).send({
                    error: "Token do Google inválido"
                })
            }


            // -----------------------------------------
            // DADOS VINDOS DO GOOGLE
            // -----------------------------------------

            const {
                email,
                name,
                email_verified
            } = payload


            console.log(
                ">>> Dados recebidos do Google:",
                {
                    email,
                    name,
                    email_verified
                }
            )


            // -----------------------------------------
            // VALIDA O E-MAIL
            // -----------------------------------------

            if (!email) {

                return reply.status(401).send({
                    error: "O Google não informou o e-mail do usuário"
                })
            }


            if (!email_verified) {

                return reply.status(401).send({
                    error: "O e-mail do Google não foi verificado"
                })
            }


            // -----------------------------------------
            // PROCURA O PROFESSOR PELO E-MAIL
            // -----------------------------------------

            let professor = await prisma.professor.findUnique({

                where: {
                    email: email
                }

            })


            // -----------------------------------------
            // SE NÃO EXISTIR, CRIA
            // -----------------------------------------

            if (!professor) {

                console.log(
                    ">>> Professor não encontrado."
                )

                console.log(
                    ">>> Criando novo professor..."
                )


                professor = await prisma.professor.create({

                    data: {

                        nome: name || "Usuário Google",

                        email: email,

                        tipo: "comum",

                        senha: null

                    }

                })


                console.log(
                    ">>> ✅ Professor criado:",
                    professor.id
                )

            } else {

                console.log(
                    ">>> ✅ Professor já cadastrado:",
                    professor.id
                )

            }


            // -----------------------------------------
            // GERA O JWT DO GEOCONNECT
            // -----------------------------------------

            const token = server.jwt.sign(

                {
                    id: professor.id,
                    email: professor.email,
                    tipo: professor.tipo
                },

                {
                    expiresIn: "7d"
                }

            )


            console.log(
                ">>> ✅ JWT gerado"
            )


            // -----------------------------------------
            // ENVIA PARA O FRONTEND
            // -----------------------------------------

            return reply.send({

                token,

                professor: {

                    id: professor.id,

                    nome: professor.nome,

                    email: professor.email,

                    tipo: professor.tipo

                }

            })


        } catch (error) {

            console.error(
                "===================================="
            )

            console.error(
                ">>> ❌ ERRO NO LOGIN COM GOOGLE"
            )

            console.error(error)

            console.error(
                "===================================="
            )


            return reply.status(401).send({

                error:
                    "Não foi possível autenticar com o Google."

            })

        }

    })



    // =================================================
    // USUÁRIO LOGADO
    // =================================================

    server.get(

        "/me",

        {
            onRequest: [server.authenticate]
        },

        async (request, reply) => {


            const professorId = request.user.id


            const professor =
                await prisma.professor.findUnique({

                    where: {

                        id: professorId

                    },

                    select: {

                        id: true,

                        nome: true,

                        email: true,

                        tipo: true

                    }

                })


            if (!professor) {

                return reply.status(404).send({

                    message:
                        "Professor não encontrado"

                })

            }


            return reply.send(professor)

        }

    )

}