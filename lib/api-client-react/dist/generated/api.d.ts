import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CallRequest, CallRequestInput, CallRequestResponse, ErrorResponse, HealthStatus, MarkReadResponse, Message, MessageInput, Room, RoomInput, UpdateCallRequestInput, VerifyPinInput, VerifyPinResponse } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateRoomUrl: () => string;
/**
 * @summary Create a new call room
 */
export declare const createRoom: (roomInput: RoomInput, options?: RequestInit) => Promise<Room>;
export declare const getCreateRoomMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createRoom>>, TError, {
        data: BodyType<RoomInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createRoom>>, TError, {
    data: BodyType<RoomInput>;
}, TContext>;
export type CreateRoomMutationResult = NonNullable<Awaited<ReturnType<typeof createRoom>>>;
export type CreateRoomMutationBody = BodyType<RoomInput>;
export type CreateRoomMutationError = ErrorType<unknown>;
/**
* @summary Create a new call room
*/
export declare const useCreateRoom: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createRoom>>, TError, {
        data: BodyType<RoomInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createRoom>>, TError, {
    data: BodyType<RoomInput>;
}, TContext>;
export declare const getGetRoomUrl: (roomId: string) => string;
/**
 * @summary Get room details
 */
export declare const getRoom: (roomId: string, options?: RequestInit) => Promise<Room>;
export declare const getGetRoomQueryKey: (roomId: string) => readonly [`/api/rooms/${string}`];
export declare const getGetRoomQueryOptions: <TData = Awaited<ReturnType<typeof getRoom>>, TError = ErrorType<ErrorResponse>>(roomId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRoom>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRoom>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRoomQueryResult = NonNullable<Awaited<ReturnType<typeof getRoom>>>;
export type GetRoomQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get room details
 */
export declare function useGetRoom<TData = Awaited<ReturnType<typeof getRoom>>, TError = ErrorType<ErrorResponse>>(roomId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRoom>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getVerifyPinUrl: (roomId: string) => string;
/**
 * @summary Verify the room PIN before joining
 */
export declare const verifyPin: (roomId: string, verifyPinInput: VerifyPinInput, options?: RequestInit) => Promise<VerifyPinResponse>;
export declare const getVerifyPinMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof verifyPin>>, TError, {
        roomId: string;
        data: BodyType<VerifyPinInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof verifyPin>>, TError, {
    roomId: string;
    data: BodyType<VerifyPinInput>;
}, TContext>;
export type VerifyPinMutationResult = NonNullable<Awaited<ReturnType<typeof verifyPin>>>;
export type VerifyPinMutationBody = BodyType<VerifyPinInput>;
export type VerifyPinMutationError = ErrorType<ErrorResponse>;
/**
* @summary Verify the room PIN before joining
*/
export declare const useVerifyPin: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof verifyPin>>, TError, {
        roomId: string;
        data: BodyType<VerifyPinInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof verifyPin>>, TError, {
    roomId: string;
    data: BodyType<VerifyPinInput>;
}, TContext>;
export declare const getGetMessagesUrl: (roomId: string) => string;
/**
 * @summary Get all messages for a room
 */
export declare const getMessages: (roomId: string, options?: RequestInit) => Promise<Message[]>;
export declare const getGetMessagesQueryKey: (roomId: string) => readonly [`/api/rooms/${string}/messages`];
export declare const getGetMessagesQueryOptions: <TData = Awaited<ReturnType<typeof getMessages>>, TError = ErrorType<ErrorResponse>>(roomId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMessages>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMessagesQueryResult = NonNullable<Awaited<ReturnType<typeof getMessages>>>;
export type GetMessagesQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get all messages for a room
 */
export declare function useGetMessages<TData = Awaited<ReturnType<typeof getMessages>>, TError = ErrorType<ErrorResponse>>(roomId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSendMessageUrl: (roomId: string) => string;
/**
 * @summary Send a message to the parent
 */
export declare const sendMessage: (roomId: string, messageInput: MessageInput, options?: RequestInit) => Promise<Message>;
export declare const getSendMessageMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
        roomId: string;
        data: BodyType<MessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
    roomId: string;
    data: BodyType<MessageInput>;
}, TContext>;
export type SendMessageMutationResult = NonNullable<Awaited<ReturnType<typeof sendMessage>>>;
export type SendMessageMutationBody = BodyType<MessageInput>;
export type SendMessageMutationError = ErrorType<ErrorResponse>;
/**
* @summary Send a message to the parent
*/
export declare const useSendMessage: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
        roomId: string;
        data: BodyType<MessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof sendMessage>>, TError, {
    roomId: string;
    data: BodyType<MessageInput>;
}, TContext>;
export declare const getMarkMessagesReadUrl: (roomId: string) => string;
/**
 * @summary Mark all messages in a room as read
 */
export declare const markMessagesRead: (roomId: string, options?: RequestInit) => Promise<MarkReadResponse>;
export declare const getMarkMessagesReadMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markMessagesRead>>, TError, {
        roomId: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof markMessagesRead>>, TError, {
    roomId: string;
}, TContext>;
export type MarkMessagesReadMutationResult = NonNullable<Awaited<ReturnType<typeof markMessagesRead>>>;
export type MarkMessagesReadMutationError = ErrorType<unknown>;
/**
* @summary Mark all messages in a room as read
*/
export declare const useMarkMessagesRead: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markMessagesRead>>, TError, {
        roomId: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof markMessagesRead>>, TError, {
    roomId: string;
}, TContext>;
export declare const getGetCallRequestUrl: (roomId: string) => string;
/**
 * @summary Get pending call request for a room
 */
export declare const getCallRequest: (roomId: string, options?: RequestInit) => Promise<CallRequestResponse>;
export declare const getGetCallRequestQueryKey: (roomId: string) => readonly [`/api/rooms/${string}/call`];
export declare const getGetCallRequestQueryOptions: <TData = Awaited<ReturnType<typeof getCallRequest>>, TError = ErrorType<unknown>>(roomId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCallRequest>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCallRequest>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCallRequestQueryResult = NonNullable<Awaited<ReturnType<typeof getCallRequest>>>;
export type GetCallRequestQueryError = ErrorType<unknown>;
/**
 * @summary Get pending call request for a room
 */
export declare function useGetCallRequest<TData = Awaited<ReturnType<typeof getCallRequest>>, TError = ErrorType<unknown>>(roomId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCallRequest>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateCallRequestUrl: (roomId: string) => string;
/**
 * @summary Initiate a call (ring the other side)
 */
export declare const createCallRequest: (roomId: string, callRequestInput: CallRequestInput, options?: RequestInit) => Promise<CallRequest>;
export declare const getCreateCallRequestMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCallRequest>>, TError, {
        roomId: string;
        data: BodyType<CallRequestInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCallRequest>>, TError, {
    roomId: string;
    data: BodyType<CallRequestInput>;
}, TContext>;
export type CreateCallRequestMutationResult = NonNullable<Awaited<ReturnType<typeof createCallRequest>>>;
export type CreateCallRequestMutationBody = BodyType<CallRequestInput>;
export type CreateCallRequestMutationError = ErrorType<ErrorResponse>;
/**
* @summary Initiate a call (ring the other side)
*/
export declare const useCreateCallRequest: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCallRequest>>, TError, {
        roomId: string;
        data: BodyType<CallRequestInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCallRequest>>, TError, {
    roomId: string;
    data: BodyType<CallRequestInput>;
}, TContext>;
export declare const getUpdateCallRequestUrl: (roomId: string, callId: number) => string;
/**
 * @summary Answer or decline a call
 */
export declare const updateCallRequest: (roomId: string, callId: number, updateCallRequestInput: UpdateCallRequestInput, options?: RequestInit) => Promise<CallRequest>;
export declare const getUpdateCallRequestMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCallRequest>>, TError, {
        roomId: string;
        callId: number;
        data: BodyType<UpdateCallRequestInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCallRequest>>, TError, {
    roomId: string;
    callId: number;
    data: BodyType<UpdateCallRequestInput>;
}, TContext>;
export type UpdateCallRequestMutationResult = NonNullable<Awaited<ReturnType<typeof updateCallRequest>>>;
export type UpdateCallRequestMutationBody = BodyType<UpdateCallRequestInput>;
export type UpdateCallRequestMutationError = ErrorType<ErrorResponse>;
/**
* @summary Answer or decline a call
*/
export declare const useUpdateCallRequest: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCallRequest>>, TError, {
        roomId: string;
        callId: number;
        data: BodyType<UpdateCallRequestInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCallRequest>>, TError, {
    roomId: string;
    callId: number;
    data: BodyType<UpdateCallRequestInput>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map