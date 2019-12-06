export interface UserStory {
  rawMessages: string[];
  number: number;
  links: Array<{
    userStory: UserStory,
    isDependencyOf?: number,
    hasPurposeTo?: number,
  }>;
}
