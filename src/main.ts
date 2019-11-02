import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { configService } from './shared/Config/config.service'
import * as apm from 'swagger-stats'
import * as fastifyRateLimit from 'fastify-rate-limit'
import * as helmet from 'fastify-helmet'
import * as compress from 'fastify-compress'
import { ValidationPipe } from '@nestjs/common'

declare const module: any

async function bootstrap() {
    const fastifyAdapter = new FastifyAdapter({
        logger: (await configService.get('MODE')) === 'PROD' ? false : true,
    })

    // Set request limit as 1 for per second
    fastifyAdapter.register(fastifyRateLimit, {
        max: 60,
        timeWindow: 60 * 1000,
        whitelist: ['127.0.0.1'],
    })

    fastifyAdapter.register(helmet) // Initialize security middleware module 'fastify-helmet'
    fastifyAdapter.register(compress) // Initialize fastify-compress to better handle high-level traffic

    const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyAdapter)

    app.setGlobalPrefix('/api/v1') // Setting base path

    app.useGlobalPipes(new ValidationPipe()) // Initialize global validation

    // Configure the Swagger API Doc
    const options = new DocumentBuilder()
        .setTitle('Product Analyzer API Documentation')
        .setVersion('1.0')
        .setBasePath('api/v1')
        .addBearerAuth()
        .build()
    const document = SwaggerModule.createDocument(app, options)
    SwaggerModule.setup('/api/v1', app, document)

    // Configure the APM
    const apmConfig = {
        authentication: true,
        onAuthenticate(username, password) {
            return (
                username === configService.get('APM_USERNAME') &&
                password === configService.get('APM_PASSWORD')
            )
        },
        uriPath: '/api/status',
        version: '0.95.11',
    }

    app.use(apm.getMiddleware(apmConfig)) // Initialize APM

    app.listen(await configService.get('APP_PORT'))

    if (module.hot) {
        module.hot.accept()
        module.hot.dispose(() => app.close())
    }
}

bootstrap()
