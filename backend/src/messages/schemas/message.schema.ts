import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type SchemaDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message{

  @Prop()
  message: string;

  @Prop()
  from: string;

  @Prop()
  recipient: string;

  createdAt: Date;

}

export const MessageSchema = SchemaFactory.createForClass(Message);
