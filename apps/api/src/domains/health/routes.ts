import { MockHealthRepository } from './repository'
import { HealthResponseSchema } from '@workspace/api'
import { RoutesProvider } from '@/index'

export async function healthRoutes(routes: RoutesProvider) {
  const healthRepository = new MockHealthRepository()

  routes.get('/', {
    schema: {
      response: {
        200: HealthResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const healthData = await healthRepository.status()
      const response = {
        success: true,
        timestamp: new Date().toISOString(),
        data: healthData,
      }
      reply.send(response)
    },
  })
}
