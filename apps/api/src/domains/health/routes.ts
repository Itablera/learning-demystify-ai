import { FastifyInstance } from "fastify";
import { MockHealthRepository } from "./repository";

export async function healthRoutes(fastify: FastifyInstance) {
    const healthRepository = new MockHealthRepository();
    fastify.get('/', {
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                    },
                },
            },
        },
        handler: async (request, reply) => {
            const health = await healthRepository.status();
            reply.code(200).send(health);
        },
    });
}