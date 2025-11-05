import type { OntologyAnnotation, ProcessParameterValue } from "@/lib/schemas/types_isa";

/**
 * Typeguard for checking if a comment exists which defines this parameter Value as a OntologyAnnotation
 * @param parameterValue
 */
export function isOntologyValue(parameterValue: ProcessParameterValue): parameterValue is ProcessParameterValue & { value: OntologyAnnotation } {
    const flag = parameterValue?.category?.comments?.find((c) => c.name === "valueIsOntology")?.value;
    return flag === "true";
}