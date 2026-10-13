import { GetCharactersCharacterIdOk } from './esi-api/characters/models/GetCharactersCharacterIdOk';

/** Public character fields composed from the generated ESI character DTO. */
export interface CharacterPublicInfo {
    characterId: number;
    name: string;
    corporationId: number;
    bloodlineId: number;
    raceId: number;
    birthday: Date;
}

/** Builds a business object from a generated Character API DTO. */
export class CharacterPublicInfoService {
    compose(characterId: number, dto: GetCharactersCharacterIdOk): CharacterPublicInfo {
        return {
            characterId,
            name: dto.name,
            corporationId: dto.corporation_id,
            bloodlineId: dto.bloodline_id,
            raceId: dto.race_id,
            birthday: dto.birthday,
        };
    }
}
