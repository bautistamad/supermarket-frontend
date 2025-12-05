export interface IUsuario {
  id?: number;
  username: string;
  email: string;
  fechaCreacion?: string;
}

export interface ILoginRequest {
  username: string;
  password: string;
}
