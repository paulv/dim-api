import asyncHandler from 'express-async-handler';
import { readTransaction } from '../db';
import { getSettings } from '../db/settings-queries';
import { getLoadoutsForProfile } from '../db/loadouts-queries';
import { getItemAnnotationsForProfile } from '../db/item-annotations-queries';
import { badRequest } from '../utils';
import { ProfileResponse } from '../shapes/profile';
import { DestinyVersion } from '../shapes/general';
import { defaultSettings } from '../shapes/settings';

export const profileHandler = asyncHandler(async (req, res) => {
  const { bungieMembershipId } = req.user!;

  const platformMembershipId = req.query.platformMembershipId as string;
  const destinyVersion: DestinyVersion = req.query.destinyVersion
    ? (parseInt(req.query.destinyVersion.toString(), 10) as DestinyVersion)
    : 2;
  const components = ((req.query.components as string) || '').split(/\s*,\s*/);

  if (!components) {
    badRequest(res, 'No components provided');
    return;
  }

  // TODO: Maybe do parallel non-transactional reads instead
  await readTransaction(async (client) => {
    const response: ProfileResponse = {};

    if (components.includes('settings')) {
      response.settings = {
        ...defaultSettings,
        ...(await getSettings(client, bungieMembershipId)),
      };
    }

    if (components.includes('loadouts')) {
      if (!platformMembershipId) {
        badRequest(res, 'Need a platformMembershipId to return loadouts');
        return;
      }
      response.loadouts = await getLoadoutsForProfile(
        client,
        bungieMembershipId,
        platformMembershipId,
        destinyVersion
      );
    }

    if (components.includes('tags')) {
      if (!platformMembershipId) {
        badRequest(
          res,
          'Need a platformMembershipId to return item annotations'
        );
        return;
      }
      response.tags = await getItemAnnotationsForProfile(
        client,
        bungieMembershipId,
        platformMembershipId,
        destinyVersion
      );
    }

    // Instruct CF not to cache this
    res.set('Cache-Control', 'no-cache, max-age=0');
    res.send(response);
  });
});
