export interface Keyword {
  id: string;
  employee_id: string;
  text: string;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateKeywordInput {
  text: string;
  category?: string;
}

