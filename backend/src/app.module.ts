import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';
import { setServers } from 'dns';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { VendorModule } from './vendor/vendor.module';
import { EmailModule } from './email/email.module';
import { DeliveryModule } from './delivery/delivery.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(__dirname, '..', '.env'), '.env'],
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGODB_URI');
        const dnsServers = config.get<string>('DB_DNS_SERVERS');

        if (!uri) {
          throw new Error(
            'Missing MONGODB_URI. Add it to backend/.env or run `npm run db:debug` from backend for details.',
          );
        }

        if (dnsServers) {
          const servers = dnsServers
            .split(',')
            .map((server) => server.trim())
            .filter(Boolean);

          if (servers.length) {
            setServers(servers);
          }
        }

        return {
          uri,
          serverSelectionTimeoutMS: 10000,
          connectTimeoutMS: 10000,
        };
      },
    }),

    AuthModule,
    UsersModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    VendorModule,
    EmailModule,
    DeliveryModule,
    CategoriesModule,
  ],
})
export class AppModule {}
