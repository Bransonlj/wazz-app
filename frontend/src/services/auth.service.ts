import axios from "axios";
import BaseService from "./base.service";
import { LoginReponseDto, LoginRequestDto, RegisterRequestDto } from "../dto";

const url = "http://localhost:5000/auth";

interface ErrorResponseDto {
  statusCode: number;
  message: string;
  error?: string;
}

function axiosErrorResponseParser(errorResponseDto: ErrorResponseDto): string {
  return errorResponseDto.message;
} 

export default class AuthService extends BaseService {
  static async loginUser(loginDto: LoginRequestDto): Promise<LoginReponseDto> {
    const endpoint = url + "/login";
    return axios.post(endpoint, loginDto, {
      headers: {
        "Content-Type": 'application/json'
      }
    }).then(AuthService._handleAxiosSuccess<LoginReponseDto>)
      .catch(error => {
        throw new Error(AuthService._handleAxiosError<ErrorResponseDto>(error, axiosErrorResponseParser));
    });
  }

  static async registerUser(registertDto: RegisterRequestDto): Promise<void> {
    const endpoint = url + "/register";
    return axios.post(endpoint, registertDto, {
      headers: {
        "Content-Type": 'application/json'
      }
    }).then(AuthService._handleAxiosSuccess<void>)
      .catch(error => {
        throw new Error(AuthService._handleAxiosError<ErrorResponseDto>(error, axiosErrorResponseParser));
    })
}

}