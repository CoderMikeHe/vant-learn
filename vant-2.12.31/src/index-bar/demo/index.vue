<template>
  <demo-section>
    <van-tabs v-model="activeTab" swipe-threshold="3">
      <van-tab :title="t('basicUsage')">
        <van-index-bar>
          <div v-for="index in indexList" :key="index">
            <van-index-anchor :index="index" />
            <van-cell :title="t('text')" />
            <van-cell :title="t('text')" />
            <van-cell :title="t('text')" />
          </div>
        </van-index-bar>
      </van-tab>

      <van-tab :title="t('customIndexList')">
        <van-index-bar :index-list="customIndexList">
          <div v-for="index in customIndexList" :key="index">
            <van-index-anchor :index="index">
              {{ t('title') + index }}
            </van-index-anchor>
            <van-cell :title="t('text')" />
            <van-cell :title="t('text')" />
            <van-cell :title="t('text')" />
          </div>
        </van-index-bar>
      </van-tab>

      <van-tab title="微信通讯录">
        <van-index-bar :index-list="contactsIndexs" :ignore-tags="['@']" hint-type="left" highlight-background-color="#07C160" highlight-color="#fff">
          <div>
            <van-index-anchor index="@" highlight-color="#07C160"><span></span></van-index-anchor>
            <van-search v-model="value" placeholder="请输入搜索关键词" />
            <van-cell :title="t('text')" />
            <van-cell :title="t('text')" />
            <van-cell :title="t('text')" />
          </div>
          
          <div v-for="index in indexList" :key="index">
            <van-index-anchor :index="index" highlight-color="#07C160" />
            <van-cell :title="t('text')" />
            <van-cell :title="t('text')" />
            <van-cell :title="t('text')" />
          </div>
        </van-index-bar>
      </van-tab>


      <van-tab title="微信通讯录(插槽)">
        <van-index-bar hint-type="left" :index-list="contactsIndexs" :ignore-tags="['@']" highlight-background-color="#07C160" highlight-color="#fff">
          <!-- tag 插槽 -->
          <template #tag="props">
            <van-icon class="index-tag search" name="search" size="14" color="#555" v-if="props.ignore" />
            <span class="index-tag" :class="{active:props.active}" v-else>{{ props.index }}</span>
          </template>

          <!-- hint 插槽 -->
          <template #hint="props">
            <div class="index-hint pop">
              <span>{{ props.index }}</span>
            </div>
          </template>

          <div>
            <van-index-anchor index="@" highlight-color="#07C160"><span></span></van-index-anchor>
            <van-search v-model="value" placeholder="请输入搜索关键词" />
            <van-cell :title="t('text')" />
            <van-cell :title="t('text')" />
            <van-cell :title="t('text')" />
          </div>

          <div v-for="index in indexList" :key="index">
            <van-index-anchor :index="index" highlight-color="#07C160" />
            <van-cell :title="t('text')" />
            <van-cell :title="t('text')" />
            <van-cell :title="t('text')" />
          </div>
        </van-index-bar>
      </van-tab>

      <van-tab title="手机通讯录">
        <van-index-bar hint-type="center" highlight-background-color="#07C160" highlight-color="#fff">
          <div v-for="index in indexList" :key="index">
            <van-index-anchor :index="index" highlight-color="#07C160" />
            <van-cell :title="t('text')" />
            <van-cell :title="t('text')" />
            <van-cell :title="t('text')" />
          </div>
        </van-index-bar>
      </van-tab>
    </van-tabs>
  </demo-section>
</template>

<script>
export default {
  i18n: {
    'zh-CN': {
      text: '文本',
      customIndexList: '自定义索引列表',
    },
    'en-US': {
      text: 'Text',
      customIndexList: 'Custom Index List',
    },
  },

  data() {
    const indexList = [];
    const charCodeOfA = 'A'.charCodeAt(0);

    for (let i = 0; i < 26; i++) {
      indexList.push(String.fromCharCode(charCodeOfA + i));
    }

    return {
      value: '',
      activeTab: 0,
      indexList,
      customIndexList: [1, 2, 3, 4, 5, 6, 8, 9, 10],
    };
  },

  computed: {
    contactsIndexs() {
      return [
        '@',
        ...this.indexList
      ]
    }
  },
};
</script>


<style lang="less" scoped>
.index-tag {
  width: 16px;
  height: 16px;
  display: inline-block;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;

  &.search {
    font-weight: bold;
  }

  &.active {
    background-color: #07C160;
    color: #fff;
    border-radius: 50%;
  }
}

.index-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  &.pop {
    position: absolute;
    right: 120%;
    top: 50%;
    margin-top: -25px;
    background-image: url('data:image/png;base64,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');
    background-repeat: no-repeat;
    background-size: 60px 50px;
    width: 60px;
    height: 50px;
    color: whitesmoke;
    & > span {
      margin-right: 5px;
    }
  }
  &.center {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    border-radius: 10px;
    background-color: black;
    color: whitesmoke;
  }
  & > span {
    font-size: 30px;
  }
}
</style>
