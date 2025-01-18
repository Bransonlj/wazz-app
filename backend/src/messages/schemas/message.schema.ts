import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { User } from "src/users/schemas/user.schema";
import * as mongoose from 'mongoose';

export type SchemaDocument = HydratedDocument<Message>;

export enum Status {
  SENT="sent",
  DELIVERED="delivered",
  READ="read",
}

@Schema({ timestamps: true })
export class Message{

  _id: string;

  @Prop()
  message: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  sender: User;


  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  recipient: User;

  @Prop({
    type: String,
    enum: Status,
    default: Status.SENT
  })
  status: Status;

  createdAt: Date;

}

export const MessageSchema = SchemaFactory.createForClass(Message);
