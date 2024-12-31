import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    EventsModule, 
    AuthModule,
    MongooseModule.forRoot('mongodb://localhost:27017/wazzapp'),
    MessagesModule,
  ],
})
export class AppModule {}
