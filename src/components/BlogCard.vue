<template>
  <div class="blog-card">
    <div class="icons" v-show="$store.state.editPost">
      <div class="icon" @click="deletePost">
        <i class="delete fas fa-trash-alt"></i>
      </div>
      <div class="icon" @click="editPost"><i class="edit fas fa-edit"></i></div>
    </div>
    <img :src="post.blogCoverPhoto" alt="" />
    <div class="info">
      <h4>{{ post.blogTitle }}</h4>
      <h6>
        发布日期：{{
          new Date(post.blogDate).toLocaleString('zh-cn', { dateStyle: 'long' })
        }}
      </h6>
      <router-link
        class="link test"
        :to="{ name: 'ViewBlog', params: { blogId: post.blogId } }"
      >
        查看文章<i class="icon fas fa-arrow-right arrow"></i>
      </router-link>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
export default {
  props: ['post'],
  setup(props) {
    const store = useStore()
    function deletePost() {
      store.dispatch('deletePost', props.post.blogId)
    }
    const router = useRouter()
    function editPost() {
      router.push({ name: 'EditBlog', params: { blogId: props.post.blogId } })
    }
    return { deletePost, editPost }
  },
}
</script>

<style lang="scss" scoped>
.blog-card {
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  background-color: #fff;
  min-height: 420px;
  transition: 0.5s ease;
  &:hover {
    transform: rotate(-1deg) scale(1.01);
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  .icons {
    display: flex;
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 99;
    .icon {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      background-color: #fff;
      transition: 0.5s ease;
      &:hover {
        background-color: #303030;
        .edit,
        .delete {
          color: white;
        }
      }
      &:nth-child(1) {
        margin-right: 8px;
      }
      .edit,
      .delete {
        font-size: 15px;
        pointer-events: none;
      }
    }
  }
  img {
    display: block;
    border-radius: 8px 8px 0 0;
    z-index: 1;
    width: 100%;
    min-height: 200px;
    object-fit: cover;
  }
  .info {
    display: flex;
    flex-direction: column;
    height: 100%;
    z-index: 3;
    padding: 32px 16px;
    color: black;
    h4 {
      padding-bottom: 8px;
      font-size: 20px;
      font-weight: 300;
    }
    h6 {
      font-weight: 400;
      font-size: 13px;
      padding-bottom: 16px;
    }
    .link {
      display: inline-flex;
      align-items: center;
      margin-top: auto;
      font-weight: 500;
      padding-top: 20px;
      font-size: 12px;
      padding-bottom: 4px;
      transition: 0.5 ease-in;
      &:hover {
        color: rgba(48, 48, 48, 0.8);
      }
      .arrow {
        width: 10px;
      }
    }
  }
}
</style>
