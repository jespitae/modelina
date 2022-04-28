import { ConstrainedObjectModel, ObjectModel } from '../../../models';
import { NO_NUMBER_START_CHAR, NO_DUPLICATE_PROPERTIES, NO_EMPTY_VALUE, NO_RESERVED_KEYWORDS} from '../../../helpers/Constraints';
import { FormatHelpers, PropertyKeyConstraint } from '../../../helpers';
import { isReservedJavaKeyword } from '../Constants';

export type PropertyKeyConstraintOptions = {
  NO_SPECIAL_CHAR: (value: string) => string;
  NO_NUMBER_START_CHAR: (value: string) => string;
  NO_DUPLICATE_PROPERTIES: (constrainedObjectModel: ConstrainedObjectModel, objectModel: ObjectModel, propertyName: string, namingFormatter: (value: string) => string) => string;
  NO_EMPTY_VALUE: (value: string) => string;
  NAMING_FORMATTER: (value: string) => string;
  NO_RESERVED_KEYWORDS: (value: string) => string;
};

export const DefaultPropertyKeyConstraints: PropertyKeyConstraintOptions = {
  NO_SPECIAL_CHAR: (value: string) => {
    //Exclude ` ` because it gets formatted by NAMING_FORMATTER
    //Exclude '_', '$' because they are allowed
    return FormatHelpers.replaceSpecialCharacters(value, { exclude: [' ', '_'], separator: '_' });
  },
  NO_NUMBER_START_CHAR,
  NO_DUPLICATE_PROPERTIES,
  NO_EMPTY_VALUE,
  NAMING_FORMATTER: FormatHelpers.toPascalCase,
  NO_RESERVED_KEYWORDS: (value: string) => {
    return NO_RESERVED_KEYWORDS(value, isReservedJavaKeyword); 
  }
};

export function defaultPropertyKeyConstraints(customConstraints?: Partial<PropertyKeyConstraintOptions>): PropertyKeyConstraint {
  const constraints = {...DefaultPropertyKeyConstraints, ...customConstraints};

  return ({propertyKey, constrainedObjectModel, objectModel}) => {
    let constrainedPropertyKey = propertyKey;

    constrainedPropertyKey = constraints.NO_SPECIAL_CHAR(constrainedPropertyKey);
    constrainedPropertyKey = constraints.NO_NUMBER_START_CHAR(constrainedPropertyKey);
    constrainedPropertyKey = constraints.NO_EMPTY_VALUE(constrainedPropertyKey);
    constrainedPropertyKey = constraints.NO_RESERVED_KEYWORDS(constrainedPropertyKey);
    constrainedPropertyKey = constraints.NAMING_FORMATTER(constrainedPropertyKey);
    constrainedPropertyKey = constraints.NO_DUPLICATE_PROPERTIES(constrainedObjectModel, objectModel, constrainedPropertyKey, constraints.NAMING_FORMATTER);
    return constrainedPropertyKey;
  };
}