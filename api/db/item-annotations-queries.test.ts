import { transaction } from '.';
import {
  updateItemAnnotation,
  getItemAnnotationsForProfile,
  deleteAllItemAnnotations,
  deleteItemAnnotation,
  deleteItemAnnotationList
} from './item-annotations-queries';

const appId = 'settings-queries-test-app';
const platformMembershipId = '213512057';
const bungieMembershipId = 4321;

beforeEach(async () => {
  await transaction(async (client) => {
    await deleteAllItemAnnotations(client, bungieMembershipId);
  });
});

it('can insert tags where none exist before', async () => {
  await transaction(async (client) => {
    await updateItemAnnotation(
      client,
      appId,
      bungieMembershipId,
      platformMembershipId,
      2,
      {
        id: '123456',
        tag: 'favorite',
        notes: 'the best'
      }
    );

    const annotations = await getItemAnnotationsForProfile(
      client,
      bungieMembershipId,
      platformMembershipId,
      2
    );
    expect(annotations[0]).toEqual({
      id: '123456',
      tag: 'favorite',
      notes: 'the best'
    });
  });
});

it('can update tags where none exist before', async () => {
  await transaction(async (client) => {
    await updateItemAnnotation(
      client,
      appId,
      bungieMembershipId,
      platformMembershipId,
      2,
      {
        id: '123456',
        tag: 'favorite',
        notes: 'the best'
      }
    );

    await updateItemAnnotation(
      client,
      appId,
      bungieMembershipId,
      platformMembershipId,
      2,
      {
        id: '123456',
        tag: 'junk',
        notes: 'the worst'
      }
    );

    const annotations = await getItemAnnotationsForProfile(
      client,
      bungieMembershipId,
      platformMembershipId,
      2
    );
    expect(annotations[0]).toEqual({
      id: '123456',
      tag: 'junk',
      notes: 'the worst'
    });
  });
});

it('can update tags clearing value', async () => {
  await transaction(async (client) => {
    await updateItemAnnotation(
      client,
      appId,
      bungieMembershipId,
      platformMembershipId,
      2,
      {
        id: '123456',
        tag: 'favorite',
        notes: 'the best'
      }
    );

    await updateItemAnnotation(
      client,
      appId,
      bungieMembershipId,
      platformMembershipId,
      2,
      {
        id: '123456',
        tag: null
      }
    );

    const annotations = await getItemAnnotationsForProfile(
      client,
      bungieMembershipId,
      platformMembershipId,
      2
    );
    expect(annotations[0]).toEqual({
      id: '123456',
      notes: 'the best'
    });
  });
});

it('can delete tags', async () => {
  await transaction(async (client) => {
    await updateItemAnnotation(
      client,
      appId,
      bungieMembershipId,
      platformMembershipId,
      2,
      {
        id: '123456',
        tag: 'favorite',
        notes: 'the best'
      }
    );

    await deleteItemAnnotation(client, bungieMembershipId, '123456');

    const annotations = await getItemAnnotationsForProfile(
      client,
      bungieMembershipId,
      platformMembershipId,
      2
    );
    expect(annotations).toEqual([]);
  });
});

it('can delete tags by setting both values to null/empty', async () => {
  await transaction(async (client) => {
    await updateItemAnnotation(
      client,
      appId,
      bungieMembershipId,
      platformMembershipId,
      2,
      {
        id: '123456',
        tag: 'favorite',
        notes: 'the best'
      }
    );

    await updateItemAnnotation(
      client,
      appId,
      bungieMembershipId,
      platformMembershipId,
      2,
      {
        id: '123456',
        tag: null,
        notes: ''
      }
    );

    const annotations = await getItemAnnotationsForProfile(
      client,
      bungieMembershipId,
      platformMembershipId,
      2
    );
    expect(annotations).toEqual([]);
  });
});

it('can clear tags', async () => {
  await transaction(async (client) => {
    await updateItemAnnotation(
      client,
      appId,
      bungieMembershipId,
      platformMembershipId,
      2,
      {
        id: '123456',
        tag: 'favorite',
        notes: 'the best'
      }
    );
    await updateItemAnnotation(
      client,
      appId,
      bungieMembershipId,
      platformMembershipId,
      2,
      {
        id: '654321',
        tag: 'junk',
        notes: 'the worst'
      }
    );

    await deleteItemAnnotationList(client, bungieMembershipId, [
      '123456',
      '654321'
    ]);

    const annotations = await getItemAnnotationsForProfile(
      client,
      bungieMembershipId,
      platformMembershipId,
      2
    );
    expect(annotations).toEqual([]);
  });
});