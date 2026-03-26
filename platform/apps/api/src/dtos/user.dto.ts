export interface CreateUserBody {
  /** @minLength 1 */
  firstName: string;
  /** @minLength 1 */
  lastName: string;
  phone?: string;
}

export interface UpdateUserBody {
  firstName?: string;
  lastName?: string;
  phone?: string;
}
