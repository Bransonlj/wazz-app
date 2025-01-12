export class EventResponseDto<T> {
  status: "error" | "success";
  data: T;
}