
import { GradeLevel, Resource, ResourceStatus, ResourceType, Subject, User, UserRole, UserStatus, Category, Review } from "../src/types";
import { MOCK_RESOURCES, MOCK_USERS, MOCK_CATEGORIES, MOCK_REVIEWS } from "../src/constants";

// Using data from constants to keep server sync with initial client state
export const SERVER_RESOURCES: Resource[] = [...MOCK_RESOURCES];

export const SERVER_USERS: User[] = [...MOCK_USERS];

export const SERVER_CATEGORIES: Category[] = [...MOCK_CATEGORIES];

export const SERVER_REVIEWS: Review[] = [...MOCK_REVIEWS];
