import { event } from "./event";
import { featuredVideo } from "./featuredVideo";
import { pageCopy, siteSettings } from "./pageCopy";
import { post } from "./post";
import { rentalItem } from "./rentalItem";
import { resultObjects, resultSet } from "./resultSet";

export const schemaTypes = [
  post,
  event,
  featuredVideo,
  rentalItem,
  resultSet,
  ...resultObjects,
  pageCopy,
  siteSettings,
];
