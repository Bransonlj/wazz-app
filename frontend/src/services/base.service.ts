import { AxiosError, AxiosResponse } from "axios";

export default abstract class BaseService {

  /**
   * Handles a successful axios query and returns the data.
   * @template T The expected type of the server's response object.
   * 
   * @param response Success response to handle, created from an axios query.
   * @returns Data returned from a successful query from the server.
   */
  protected static _handleAxiosSuccess<T>(response: AxiosResponse<T>): T {
    return response.data;
  }

  /**
   * Handles and parses an error from an Axios request.
   * Logs the error message with optional query details to assist in debugging.
   *
   * @template T - The expected type of the server's error response object.
   *
   * @param {Error | AxiosError} error - The error to handle, created from Axios request
   * 
   * @param {(data: T) => string} responseParser - A function to parse the error response object (of type T) 
   *                                               into a user-friendly string message.
   * @param {{ path?: string, name?: string }} [queryDetails] - Optional. An object containing additional 
   *                                                            details about the query which led to the error. 
   *                                                            - `path`: The API endpoint being queried.
   *                                                            - `name`: A name or label for the query.
   * @returns {string} - A formatted error message based on the error type and server response.
   *
   * @example
   * // Example usage with a custom response type and query details
   * interface ServerError {
   *   code: number;
   *   message: string;
   * }
   *
   * const responseParser = (data: ServerError) => `Error ${data.code}: ${data.message}`;
   * const queryDetails = { name: 'Get User Data', path: 'userservice.com/api/user/12345' };
   *
   * try {
   *   await axios.get('/api/user/12345');
   * } catch (error) {
   *   const message = handleAxiosError<ServerError>(error, responseParser, queryDetails);
   *   throw new Error(message);
   * }
   */
  protected static _handleAxiosError<T>(
    error: Error | AxiosError, 
    responseParser: (data: T) => string, 
    queryDetails?: { path?: string, name?: string } 
  ): string {
    // Generate the error response message
    let message: string;
    let status: number | undefined;
    if (error instanceof AxiosError) {
      if (error.response) {
        // Received response from server with status code outside 2xx (eg. 4xx, 500)
        message = responseParser(error.response.data as T);
        status = error.response.status;
      } else {
        message = `No response from server: ${error.message}`;
      }
    } else {
      message = error.message;
    }
  
    // Log the error message with query details if present
    let logMessage: string = "Error querying";
    if (queryDetails) {
      if (queryDetails.name) logMessage += ` ${queryDetails.name}`;
      if (queryDetails.path) logMessage += ` ${queryDetails.path}`;
    }
  
    if (status) logMessage += status;
  
    console.log(`${logMessage}: ${message}`);
    return message;
  }
}
