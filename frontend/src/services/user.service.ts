import axios from "axios";
import BaseService from "./base.service";
import { UserDto } from "@/dto";

const url = "http://localhost:5000/users";

interface ErrorResponseDto {
  statusCode: number;
  message: string;
  error?: string;
}

function axiosErrorResponseParser(errorResponseDto: ErrorResponseDto): string {
  return errorResponseDto.message;
} 

export default class UserService extends BaseService {
  static async findById(id: string): Promise<UserDto> {
    const endpoint = `${url}/${id}`
    return axios.get(endpoint)
      .then(this._handleAxiosSuccess<UserDto>)
      .catch(error => {
        throw new Error(this._handleAxiosError<ErrorResponseDto>(error, axiosErrorResponseParser));
    });
  }
}