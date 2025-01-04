import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type SchemaDocument = HydratedDocument<Message>;

export enum Status {
  SENT="sent",
  DELIVERED="delivered",
  READ="read",
}

@Schema({ timestamps: true })
export class Message{

  @Prop()
  message: string;

  @Prop()
  from: string;

  @Prop()
  recipient: string;

  @Prop({
    type: String,
    enum: Status,
    default: Status.SENT
  })
  status: Status;

  createdAt: Date;

}

export const MessageSchema = SchemaFactory.createForClass(Message);
