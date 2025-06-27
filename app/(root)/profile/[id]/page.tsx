import {Header} from "@/components/Header";

import VideoCard from "@/components/VideoCard";
import React from "react";
import {getAllVideosByUser} from "@/lib/actions/video";
import {user} from "@/drizzle/schema";
import {redirect} from "next/navigation";
import EmptyState from "@/components/EmptyState";

const Page = async ({ params, searchParams} :ParamsWithSearch) => {

    const { query, filter} = await searchParams;

    const { id } = await params;

    const { user, videos}= await getAllVideosByUser(id, query, filter);

    if(!user) redirect(('/404'));

    return (
        <div className="wrapper page">

            <Header subHeader ={user?.email} title={user?.name} userImg={user?.image ?? ''} />

            {videos?.length > 0 ? (
                <section className="video-grid">
                    {videos.map(({ video, user}) => (
                        <VideoCard
                            key={video.id}
                            {...video}
                            thumbnail={video.thumbnailUrl}
                            userImg={user?.image || ''}
                            username={user?.name || 'Guest'}
                        />
                    ))}
                </section>
            ) : (
                <EmptyState icon="/assets/icons/video.svg" title="No Videos Available yet" description="Video will show up when you upload them." />
            )}

        </div>
    )
}
export default Page
