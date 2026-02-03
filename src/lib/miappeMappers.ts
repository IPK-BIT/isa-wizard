import Schemas from "./schemas";

let investigationCommentMap = new Map([
  ["license", "License"],
  ["miappeVersion", "MIAPPE version"],
]);

let studyCommentMap = new Map([
  ["startDate", "Study Start Date"],
  ["endDate", "Study End Date"],
  ["contactInstitution", "Study Contact Institution"],
  ["country", "Study Country"],
  ["experimentalSite", "Study Experimental Site"],
  ["latitude", "Study Latitude"],
  ["longitude", "Study Longitude"],
  ["altitude", "Study Altitude"],
  ["dataFileLink", "Study Data File Link"],
  ["dataFileDescription", "Study Data File Description"],
  ["dataFileVersion", "Study Data File Version"],
]);

let studyDesignDescriptorMap = new Map([
  ["designDescription", "Study Design Description"],
  ["designType", "Study Design Type"],
  ["observationUnitLevelHierarchy", "Observation Unit Level Hierarchy"],
  ["observationUnitDescription", "Observation Unit Description"],
  ["descriptionOfGrowthFacility", "Description of Growth Facility"],
  ["typeOfGrowthFacility", "Type of Growth Facility"],
  ["mapOfExperimentalDesign", "Map of Experimental Design"],
]);

function createHandler(commentMap: Map<string, string>, designDescriptorMap = new Map()) {
  return {
    get(target: any, prop: any, receiver: any) {
      if (commentMap.has(prop)) {
        let comment = target.comments.find((c: any) => c.name == commentMap.get(prop));
        return comment ? comment.value : undefined;
      } else if (designDescriptorMap.has(prop)) {
        let annotation = target.studyDesignDescriptors.find((d: any) => d.annotationValue == designDescriptorMap.get(prop));
        return annotation ? annotation.comments.find((c: any) => c.name == "value").value : undefined;
      } else {
        return Reflect.get(target, prop, receiver);
      }
    },
    set(target: any, prop: any, value: any, receiver: any) {
      if (commentMap.has(prop)) {
        let comment = target.comments.find((c: any) => c.name == commentMap.get(prop));
        if (comment) {
          comment.value = value;
        } else {
          comment = Schemas.getObjectFromSchema("comment");
          comment.name = commentMap.get(prop);
          comment.value = value;
          target.comments.push(comment);
        }
        return true;
      } else if (designDescriptorMap.has(prop)) {
        let annotation = target.studyDesignDescriptors.find((d: any) => d.annotationValue == designDescriptorMap.get(prop));
        if (annotation) {
          let comment = annotation.comments.find((c: any) => c.name == "value");
          if (comment) {
            comment.value = value;
          } else {
            comment = Schemas.getObjectFromSchema("comment");
            comment.name = "value";
            comment.value = value;
          }
        } else {
          annotation = Schemas.getObjectFromSchema("ontology_annotation");
          annotation.annotationValue = designDescriptorMap.get(prop);
          let comment = Schemas.getObjectFromSchema("comment");
          comment.name = "value";
          comment.value = value;
          annotation.comments.push(comment);
          target.studyDesignDescriptors.push(annotation);
        }
        return true;
      } else {
        return Reflect.set(target, prop, value, receiver);
      }
    },
  };
}

export let miappeInvestigationHandler = createHandler(investigationCommentMap);
export let miappeStudyHandler = createHandler(studyCommentMap, studyDesignDescriptorMap);
