export interface PropsInput {
  modelValue: string | number
  type?: 'text' | 'number' | 'tel' | 'date' | 'time' | 'textarea'
  label?: string
  placeholder?: string
  required?: boolean
  error?: string
  onlyNumbers?: boolean
  maxCharacters?: number
}
