import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { MessagesModule } from 'src/messages/messages.module';
import { EventsService } from './events.service';

@Module({
  imports: [MessagesModule],
  providers: [EventsGateway, EventsService],
})
export class EventsModule {}
