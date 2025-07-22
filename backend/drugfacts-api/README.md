# DrugFacts API Backend

NestJS backend service for the DrugFacts application that provides drug information from MongoDB.

## Description

This is the backend API service for DrugFacts, built with [NestJS](https://github.com/nestjs/nest) framework. It provides RESTful endpoints to access drug information stored in MongoDB.

## Project setup

```bash
$ npm install
```

## Environment Configuration

Create a `.env` file in the backend/drugfacts-api directory:

```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=drug_facts

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API Endpoints

### Health Check
- `GET /health` - API health status

### Drug Endpoints
- `GET /api/drugs` - Search drugs with pagination
  - Query params: `q`, `therapeuticClass`, `manufacturer`, `page`, `limit`
- `GET /api/drugs/index` - Get all drugs in index.json format
- `GET /api/drugs/:slug` - Get drug by slug
- `GET /api/drugs/therapeutic-classes` - List all therapeutic classes
- `GET /api/drugs/manufacturers` - List all manufacturers
- `GET /api/drugs/count` - Get total drug count

## Testing the API

Use the included test script:
```bash
./test-api.sh
```

Or test manually:
```bash
# Health check
curl http://localhost:3001/health

# Search drugs
curl "http://localhost:3001/api/drugs?q=aspirin&limit=5"

# Get drug by slug
curl http://localhost:3001/api/drugs/mounjaro
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
