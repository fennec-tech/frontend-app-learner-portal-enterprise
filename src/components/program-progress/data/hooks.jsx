import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { getLearnerProgramProgressDetail, getLearnerProgramsList } from './service';

export function useLearnerProgramProgressData(programUUID) {
  const [learnerProgramProgressData, setLearnerProgramProgressData] = useState();
  const [fetchError, setFetchError] = useState();

  useEffect(() => {
    const fetchData = async () => {
      if (programUUID) {
        try {
          const data = await getLearnerProgramProgressDetail(programUUID);
          setLearnerProgramProgressData(data);
        } catch (error) {
          logError(error);
          setFetchError(error);
        }
      }
      return undefined;
    };
    fetchData();
  }, [programUUID]);
  return [camelCaseObject(learnerProgramProgressData), fetchError];
}

export function useLearnerProgramsListData(enterpriseUuid) {
  const [learnerProgramsListData, setLearnerProgramsListData] = useState();
  const [fetchError, setFetchError] = useState();

  useEffect(() => {
    const fetchData = async () => {
      if (enterpriseUuid) {
        try {
          const response = await getLearnerProgramsList(enterpriseUuid);
          setLearnerProgramsListData(response.data);
        } catch (error) {
          logError(error);
          setFetchError(error);
        }
      }
      return undefined;
    };
    fetchData();
  }, [enterpriseUuid]);
  return [camelCaseObject(learnerProgramsListData), fetchError];
}
