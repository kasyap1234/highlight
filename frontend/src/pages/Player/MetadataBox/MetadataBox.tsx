import { message } from 'antd';
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';

import { useAuthContext } from '../../../AuthContext';
import { Avatar } from '../../../components/Avatar/Avatar';
import UserIdentifier from '../../../components/UserIdentifier/UserIdentifier';
import { useMarkSessionAsStarredMutation } from '../../../graph/generated/hooks';
import { ReactComponent as StarIcon } from '../../../static/star.svg';
import { ReactComponent as FilledStarIcon } from '../../../static/star-filled.svg';
import { useReplayerContext } from '../ReplayerContext';
import styles from './MetadataBox.module.scss';
import { getMajorVersion } from './utils/utils';

export const MetadataBox = () => {
    const { isLoggedIn } = useAuthContext();
    const { session_id } = useParams<{ session_id: string }>();
    const { session } = useReplayerContext();

    const [markSessionAsStarred] = useMarkSessionAsStarredMutation({
        update(cache) {
            cache.modify({
                fields: {
                    session(existingSession) {
                        const updatedSession = {
                            ...existingSession,
                            starred: !existingSession.starred,
                        };
                        return updatedSession;
                    },
                },
            });
        },
    });
    const created = new Date(session?.created_at ?? 0);

    return (
        <div className={styles.locationBox}>
            <>
                {isLoggedIn && (
                    <div
                        className={styles.starIconWrapper}
                        onClick={() => {
                            markSessionAsStarred({
                                variables: {
                                    id: session_id,
                                    starred: !session?.starred,
                                },
                            })
                                .then(() => {
                                    message.success(
                                        'Updated session status!',
                                        3
                                    );
                                })
                                .catch(() => {
                                    message.error(
                                        'Error updating session status!',
                                        3
                                    );
                                });
                        }}
                    >
                        {session?.starred ? (
                            <FilledStarIcon className={styles.starredIcon} />
                        ) : (
                            <StarIcon className={styles.unstarredIcon} />
                        )}
                    </div>
                )}
                <div className={styles.userAvatarWrapper}>
                    {!session ? (
                        <Skeleton circle={true} height={36} width={36} />
                    ) : (
                        <Avatar
                            style={{ width: '36px', height: '36px' }}
                            seed={session?.identifier ?? ''}
                            shape="rounded"
                        />
                    )}
                </div>
                <div className={styles.headerWrapper}>
                    {!session ? (
                        <Skeleton
                            count={2}
                            style={{ height: 20, marginBottom: 5 }}
                        />
                    ) : (
                        <>
                            <h4 className={styles.userIdHeader}>
                                <UserIdentifier session={session} />
                            </h4>
                            <p className={styles.userIdSubHeader}>
                                {created.toLocaleString('en-us', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    weekday: 'long',
                                })}
                            </p>
                            <p className={styles.userIdSubHeader}>
                                {created.toLocaleString('en-us', {
                                    second: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    timeZoneName: 'short',
                                })}
                            </p>
                            <p className={styles.userIdSubHeader}>
                                {session?.browser_name && (
                                    <>
                                        <span>
                                            {session.browser_name}{' '}
                                            {getMajorVersion(
                                                session.browser_version
                                            )}
                                        </span>
                                        <span> • </span>
                                        <span>
                                            {session.os_name}{' '}
                                            {getMajorVersion(
                                                session.os_version
                                            )}
                                        </span>
                                    </>
                                )}
                            </p>
                        </>
                    )}
                </div>
            </>
        </div>
    );
};
