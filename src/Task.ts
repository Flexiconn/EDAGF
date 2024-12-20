import { Input } from "./Input";
import { Output } from "./Output";

export interface Task<T extends any[]> {
  id: string;
  inputs: string[];
  outputs: string[];
  run: (inputs: Input[], outputs : Output[], ...additionalArgs : T) => Promise<void>;
}