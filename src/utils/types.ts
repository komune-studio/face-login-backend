export type RequiredKeys<T> = {[K in keyof T as (null extends T[K] ? never : K)]: T[K]}
export type OptionalKeys<T> = {[K in keyof T as (null extends T[K] ? K : never)]: T[K]}
export type Mapped<T> = {[P in keyof T]: T[P]}