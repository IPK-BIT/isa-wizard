import { Xlsx } from "@fslab/fsspreadsheet";
import type { Investigation } from "@/lib/schemas/types_isa";

export type Contract = {
  DTO: any; // _FsWorkbook
  DTOType: "ISA_Investigation" | "ISA_Study" | "ISA_Assay" | "PlainText";
  Operation: "CREATE" | "READ" | "WRITE" | "UPDATE";
  Path: string;
};

export type ContractType = "ZIP" | "GIT";

export type FilesInZip = {
  name: string;
  lastModified: Date;
  input: any;
};

/**
 * Use this function to handle multiple types of Contracts.
 * Can be extended to support more patterns or maybe export the functions itself if more parameters are needed in the future
 * @param contracts
 * @param contractType "ZIP" | "GIT"
 * @returns different kind of results depending on the contract type
 */
export async function fulfillWriteContracts(contracts: Contract[], contractType: ContractType) {
  switch (contractType) {
    case "ZIP":
      return await fulfillWriteContractsZIP(contracts);
    case "GIT":
      return await fulfillWriteContractsGIT(contracts);
    default:
      break;
  }
}

async function fulfillWriteContractsZIP(contracts: Contract[]): Promise<FilesInZip[]> {
  let filesInZip = [];

  for (const contract of contracts) {
    if (contract.Operation === "CREATE" && contract.DTO !== undefined) {
      if (contract.DTOType === "PlainText") {
        continue;
      } else if (contract.DTOType === "ISA_Assay" || contract.DTOType === "ISA_Study" || contract.DTOType === "ISA_Investigation") {
        let xlsxBytes = await Xlsx.toBytes(contract.DTO);

        filesInZip.push({
          name: contract.Path,
          lastModified: new Date(),
          input: xlsxBytes,
        });
      } else {
        console.log("Warning: The given contract is not a correct ARC write contract: ", contract);
        return [];
      }
    }
  }
  // console.log(filesInZip);

  return filesInZip;
}

export type GitPayload = {
  branch: string;
  commit_message: string;
  actions: GitAction[];
};

type GitAction = {
  action: "create";
  file_path: string;
  content: any;
  encoding: "text" | "base64";
};

async function fulfillWriteContractsGIT(contracts: Contract[]): Promise<GitPayload> {
  let payload: GitPayload = {
    branch: "main",
    commit_message: "[ISA-Wizard] Initial commit.",
    actions: [],
  };

  for (const contract of contracts) {
    if (contract.Operation === "CREATE" && contract.DTO !== undefined) {
      if (contract.DTOType === "PlainText") {
        payload.actions.push({
          action: "create",
          file_path: contract.Path,
          content: contract.DTO,
          encoding: "text",
        });
      } else if (contract.DTOType === "ISA_Assay" || contract.DTOType === "ISA_Study" || contract.DTOType === "ISA_Investigation") {
        let xlsxBytes = await Xlsx.toBytes(contract.DTO);
        let base64String = btoa(String.fromCharCode.apply(null, xlsxBytes));
        payload.actions.push({
          action: "create",
          file_path: contract.Path,
          content: base64String,
          encoding: "base64",
        });
      } else {
        console.log("Warning: The given contract is not a correct ARC write contract: ", contract);
      }
    }
  }

  return payload;
}



/**
 * Go through the ISA Object and make all fields ready for ARCtrl Export
 * This function does not change the original ISA object
 * @param isaObj
 */
export function arcReadyISA(isaObj: Investigation) {
  let isaClone: Investigation = JSON.parse(JSON.stringify(isaObj)); // create deep clone object
  const studies = isaClone.studies ?? [];
  const randomID = Date.now();

  if (!isaClone.title) {
    isaClone.title = "MISSING-TITLE-" + randomID;
  }

  // Make sure identifiers exist
  if (!isaClone.identifier) {
    isaClone.identifier = "MISSING-IDENTIFIER-" + randomID;
  }


  studies?.forEach((study, index) => {
    if (study && !study.identifier) {
      study.identifier = "study" + index;
    }

    if (study.assays) {
      study.assays.forEach((assay, index) => {
        // convert assay short title in filename
        const shortName = assay?.comments?.find((c) => c.name === "filename")?.value ?? "assay" + index;
        const filename = `${shortName}/isa.assay.xlsx`;
        assay.filename = filename;
      })
    }

  })

  return isaClone;
}
