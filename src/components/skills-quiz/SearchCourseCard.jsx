import React, {
  useContext, useMemo, useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { AppContext } from '@edx/frontend-platform/react';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { StatusAlert, CardGrid } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearchMinus } from '@fortawesome/free-solid-svg-icons';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { SkillsContext } from './SkillsContextProvider';

import { NO_COURSES_ALERT_MESSAGE } from './constants';
import { useSelectedSkillsAndJobSkills } from './data/hooks';
import { useDefaultSearchFilters, useSearchCatalogs } from '../search/data/hooks';
import { UserSubsidyContext } from '../enterprise-user-subsidy';
import CourseCard from './CourseCard';
import { SubsidyRequestsContext } from '../enterprise-subsidy-requests';

const renderDialog = () => (
  <div className="lead d-flex align-items-center py-3">
    <div className="mr-3">
      <FontAwesomeIcon icon={faSearchMinus} size="2x" />
    </div>
    <p>
      { NO_COURSES_ALERT_MESSAGE }
    </p>
  </div>
);

const SearchCourseCard = ({ index }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const {
    subscriptionPlan, subscriptionLicense, couponCodes: { couponCodes }, enterpriseOffers,
  } = useContext(UserSubsidyContext);
  const { catalogsForSubsidyRequests } = useContext(SubsidyRequestsContext);

  const searchCatalogs = useSearchCatalogs({
    subscriptionPlan,
    subscriptionLicense,
    couponCodes,
    enterpriseOffers,
    catalogsForSubsidyRequests,
  });

  const { filters } = useDefaultSearchFilters({
    enterpriseConfig,
    searchCatalogs,
  });

  const { state } = useContext(SkillsContext);
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [hitCount, setHitCount] = useState(undefined);
  const { refinements } = useContext(SearchContext);
  const { skill_names: skills } = refinements;
  const { selectedJob, enrolledCourseIds } = state;
  // Top 3 Recommended courses are determined based on job-skills only, coming either from Search Job or Current Job
  const selectedJobSkills = useSelectedSkillsAndJobSkills({ getAllSkills: false });
  const skillsFacetFilter = useMemo(
    () => {
      if (selectedJobSkills) {
        return selectedJobSkills.map((skill) => `skill_names:${skill}`);
      }
      return [];
    },
    [selectedJobSkills],
  );
  useEffect(
    () => {
      async function fetchCourses() {
        setIsLoading(true);
        const { hits, nbHits } = await index.search('', {
          filters: `content_type:course AND ${filters}`, // eslint-disable-line object-shorthand
          facetFilters: [
            skillsFacetFilter,
          ],
        });
        if (nbHits > 0) {
          const hitsCamelCased = camelCaseObject(hits);
          const hitsWithoutAlreadyEnrolledCourses = hitsCamelCased.filter(el => !enrolledCourseIds.find(
            ele => el.advertisedCourseRun.key === ele,
          ));

          setCourses(hitsWithoutAlreadyEnrolledCourses.length <= 3 ? hitsWithoutAlreadyEnrolledCourses
            : hitsWithoutAlreadyEnrolledCourses.slice(0, 3));
          setHitCount(nbHits);
          setIsLoading(false);
        } else {
          setHitCount(nbHits);
          setIsLoading(false);
        }
      }
      fetchCourses();
    },
    [enrolledCourseIds, filters, index, selectedJob, skills, skillsFacetFilter],
  );

  if (hitCount === 0) {
    return (
      <StatusAlert
        className="mt-4 mb-5"
        alertType="info"
        dialog={renderDialog()}
        dismissible={false}
        open
      />
    );
  }

  return (
    <div>
      <h3 className="mb-3">Get started with these courses</h3>
      <CardGrid>
        {courses.map(course => (
          <CourseCard
            key={uuidv4()}
            isLoading={isLoading}
            course={course}
            allSkills={selectedJobSkills}
          />
        ))}
      </CardGrid>
    </div>
  );
};

SearchCourseCard.propTypes = {
  index: PropTypes.shape({
    appId: PropTypes.string,
    indexName: PropTypes.string,
    search: PropTypes.func.isRequired,
  }).isRequired,
};

export default SearchCourseCard;
