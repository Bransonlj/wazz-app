export interface SocketResponseDto<T> {
  status: "error" | "success";
  data: T;
}