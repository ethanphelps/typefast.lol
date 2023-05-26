export interface Ingredient {
    id: number;
    name: string;
    quantity: number;
}
export interface InstructionStep {
    id: number;
    description: string;
    prePrep: boolean;
}
export interface Recipe {
    id: string;
    name: string;
    prepTime: string;
    cookTime: string;
    description: string;
    serves: number;
    ingredients: Ingredient[];
    instructions: InstructionStep[];
}