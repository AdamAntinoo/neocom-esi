const assert = require('node:assert/strict');
const test = require('node:test');
const { CharacterPublicInfoService } = require('../dist/character-public-info');
const {
  GetCharactersCharacterIdOkFromJSON,
} = require('../dist/esi-api/characters/models/GetCharactersCharacterIdOk');

test('composes a public character from the generated ESI DTO', () => {
  const dto = GetCharactersCharacterIdOkFromJSON({
    birthday: '2013-09-09T19:40:09Z',
    bloodline_id: 6,
    corporation_id: 1000077,
    gender: 'male',
    name: 'Perico Tuerto',
    race_id: 4,
  });

  const info = new CharacterPublicInfoService().compose(93813310, dto);

  assert.equal(info.characterId, 93813310);
  assert.equal(info.name, 'Perico Tuerto');
  assert.equal(info.corporationId, 1000077);
  assert.equal(info.bloodlineId, 6);
  assert.equal(info.raceId, 4);
  assert.equal(info.birthday.toISOString(), '2013-09-09T19:40:09.000Z');
});
