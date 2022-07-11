import { ConstrainedObjectModel, ConstrainedEnumModel} from '../models/ConstrainedMetaModel';
import { ObjectModel, EnumModel } from '../models/MetaModel';

export function NO_NUMBER_START_CHAR(value: string): string {
  const firstChar = value.charAt(0);
  if (firstChar !== '' && !isNaN(+firstChar)) {
    return `number_${value}`;
  }
  return value;
}

/**
 * Because a lot of the other constrain functions (such as NO_NUMBER_START_CHAR, NO_EMPTY_VALUE, etc) they might manipulate the property names by append, prepend, or manipulate it any other way. 
 * We then need to make sure that they don't clash with any existing properties, this is what this function handles.
 * If so, prepend `reserved_` to the property name and recheck.
 * 
 * @param constrainedObjectModel the current constrained object model, which contains already existing constrained properties
 * @param objectModel the raw object model which is non-constrained to the output language.
 * @param propertyName one of the properties in objectModel which might have been manipulated
 * @param namingFormatter the name formatter which are used to format the property key
 * @returns 
 */
export function NO_DUPLICATE_PROPERTIES(constrainedObjectModel: ConstrainedObjectModel, objectModel: ObjectModel, propertyName: string, namingFormatter: (value: string) => string): string {
  // Make sure that the given property name is formatted correctly for further comparisons
  const formattedPropertyName = namingFormatter(propertyName);
  let newPropertyName = propertyName;
  const alreadyPartOfMetaModel = Object.keys(objectModel.properties)
    .filter((key) => propertyName !== key) // Filter out the potential same property name that we can safely ignore for this check.
    .includes(formattedPropertyName);
  const alreadyPartOfConstrainedModel = Object.keys(constrainedObjectModel.properties)
    .includes(formattedPropertyName);
  if (alreadyPartOfMetaModel || alreadyPartOfConstrainedModel) {
    newPropertyName = `reserved_${propertyName}`;
    newPropertyName = NO_DUPLICATE_PROPERTIES(constrainedObjectModel, objectModel, newPropertyName, namingFormatter);
  }
  return newPropertyName;
}

/**
 * Because a lot of the other constrain functions (such as NO_NUMBER_START_CHAR, NO_EMPTY_VALUE, etc) they might manipulate the enum keys by append, prepend, or manipulate it any other way. 
 * We then need to make sure that they don't clash with any existing enum keys, this is what this function handles.
 * If so, prepend `reserved_` to the enum key and recheck.
 * 
 * @param constrainedEnumModel the current constrained enum model, which contains already existing constrained enum keys
 * @param enumModel the raw enum model which is non-constrained to the output language.
 * @param enumKey one of the enum keys in enumModel which might have been manipulated
 * @param namingFormatter the name formatter which are used to format the enum key
 * @returns 
 */
export function NO_DUPLICATE_ENUM_KEYS(constrainedEnumModel: ConstrainedEnumModel, enumModel: EnumModel, enumKey: string, namingFormatter: (value: string) => string): string {
  const formattedEnumKey = namingFormatter(enumKey);
  let newEnumKey = enumKey;

  const alreadyPartOfMetaModel = enumModel.values
    .map((model) => model.key)
    .filter((key) => enumKey !== key)
    .includes(formattedEnumKey);
  const alreadyPartOfConstrainedModel = constrainedEnumModel.values
    .map((model) => model.key)
    .includes(formattedEnumKey);
  
  if (alreadyPartOfMetaModel || alreadyPartOfConstrainedModel) {
    newEnumKey = `reserved_${enumKey}`;
    newEnumKey = NO_DUPLICATE_ENUM_KEYS(constrainedEnumModel, enumModel, newEnumKey, namingFormatter);
  }
  return newEnumKey;
}

export function NO_EMPTY_VALUE(value: string): string {
  if (value === '') {
    return 'empty';
  }
  return value;
}

export function NO_RESERVED_KEYWORDS(
  propertyName: string,
  reservedKeywordCallback: (value: string) => boolean): string {
  if (reservedKeywordCallback(propertyName)) { 
    return `reserved_${propertyName}`;
  }
  return propertyName;
}