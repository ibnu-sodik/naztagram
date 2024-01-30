<script setup>
import { useUserStore } from '@/stores/users';
import { storeToRefs } from 'pinia';
import { defineProps } from 'vue'
import { useRoute } from 'vue-router';
import UploadPhotoModal from './UploadPhotoModal.vue';
import { supabase } from '@/supabase';

const route = useRoute();
const userStore = useUserStore();

const {user} = storeToRefs(userStore)
const { username: profileUsername } = route.params

const props = defineProps([
    'user', 
    'userInfo', 
    'addNewPost', 
    'isFollowing', 
    'updateIsFollowing'
]);

const followUser = async () => {
    props.updateIsFollowing(true)
    await supabase.from("follow").insert({
        follower_id: user.value.id,
        following_id: props.user.id
    })
}
const unFollow = async () => {
    props.updateIsFollowing(false)
    await supabase.from("follow")
    .delete()
    .eq("follower_id", user.value.id)
    .eq("following_id", props.user.id)
}
</script>

<template>
    <div class="userbar-container" v-if="props.user"> 
        <div class="top-content">
            <ATypographyTitle :level="2">{{ props.user.username }}</ATypographyTitle>
            <div v-if="user">
                <UploadPhotoModal 
                    v-if="profileUsername === user.username"
                    :addNewPost="addNewPost"    
                />
                <div v-else>
                    <AButton v-if="!props.isFollowing" @click="followUser">Follow</AButton>
                    <AButton v-else @click="unFollow">Following</AButton>
                </div>
            </div>
        </div>
        <div class="bottom-content">
            <ATypographyTitle :level="5">{{ props.userInfo.posts }} Post</ATypographyTitle>
            <ATypographyTitle :level="5">{{ props.userInfo.followers }} Followers</ATypographyTitle>
            <ATypographyTitle :level="5">{{ props.userInfo.following }} Following</ATypographyTitle>
        </div>
    </div>
    <div v-else class="userbar-container">
        <div class="top-content">
            <ATypographyTitle :level="2">User Not Found</ATypographyTitle>
        </div>
    </div>
</template>

<style scoped>
.userbar-container {
    padding-bottom: 75px;
}
.bottom-content {
    display: flex;
    align-items: center;
}
.bottom-content h5 {
    margin: 0 !important;
    padding: 0;
    margin-right: 30px !important;
    align-items: center;
}
.top-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>