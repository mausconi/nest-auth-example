import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';
import * as connectPgSimple from 'connect-pg-simple';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      validationError: { target: false },
    }),
  );
  app.use(cookieParser(process.env.APP_SECRET));
  app.use(
    session({
      secret: process.env.APP_SECRET as string,
      resave: false,
      saveUninitialized: false,
      store:
        process.env.NODE_ENV === 'production'
          ? new (connectPgSimple(session))()
          : new session.MemoryStore(),
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
