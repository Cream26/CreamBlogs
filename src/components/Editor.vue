<template>
  <loading v-show="loading" />
  <section ref="editor" id="editor"></section>
</template>

<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import firebase from 'firebase/app'
import 'firebase/storage'
import Quill from 'quill'
import { onMounted, ref, watch, onUnmounted, onBeforeUnmount } from 'vue'
import Loading from './Loading.vue'

const defaultOptions = {
  theme: 'snow',
  boundary: document.body,
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ direction: 'rtl' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ['clean'],
      ['link', 'image', 'video'],
    ],
  },
  placeholder: '请在此处写下文章...',
  readOnly: false,
}
export default {
  components: { Loading },
  name: 'quill-editor',
  props: {
    content: String,
    value: String,
    disabled: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
  emits: ['ready', 'change', 'input', 'blur', 'focus', 'update:value'],
  setup(props, context) {
    let loading = ref(null)
    const state = {
      editorOption: {},
      quill: null,
    }

    let _content = ''

    watch(
      () => props.value,
      (val) => {
        if (state.quill) {
          if (val && val !== _content) {
            _content = val
            state.quill.pasteHTML(val)
          } else if (!val) {
            state.quill.setText('')
          }
        }
      },
    )

    watch(
      () => props.content,
      (val) => {
        if (state.quill) {
          if (val && val !== _content) {
            _content = val
            state.quill.pasteHTML(val)
          } else if (!val) {
            state.quill.setText('')
          }
        }
      },
    )

    watch(
      () => props.disabled,
      (val) => {
        if (state.quill) {
          state.quill.enable(!val)
        }
      },
    )

    const editor = ref(null)

    const mergeOptions = (def, custom) => {
      for (const key in custom) {
        if (!def[key] || key !== 'modules') {
          def[key] = custom[key]
        } else {
          mergeOptions(def[key], custom[key])
        }
      }
      return def
    }

    const initialize = () => {
      if (editor.value) {
        // Options
        state.editorOption = mergeOptions(defaultOptions, props.options)
        state.editorOption.readOnly = props.disabled ? true : false
        // Instance
        state.quill = new Quill(editor.value, state.editorOption)

        // 图片处理
        state.quill
          .getModule('toolbar')
          .addHandler(
            'image',
            (file, editor, cursorLocation, resetUploader) => {
              const input = document.createElement('input')
              input.setAttribute('type', 'file')
              input.click()

              // Listen upload local image and save to server
              input.onchange = () => {
                const file = input.files[0]
                console.log(file.type)
                // file type is only image.
                if (/^image\//.test(file.type)) {
                  const storageRef = firebase.storage().ref()
                  const docRef = storageRef.child(
                    `documents/blogPostPhotos/${file.name}`,
                  )
                  loading.value = true
                  docRef.put(file).on(
                    'state_changed',
                    (snapshot) => {
                      console.log(snapshot)
                    },
                    (err) => {
                      console.log(err)
                    },
                    async () => {
                      const downloadURL = await docRef.getDownloadURL()
                      state.quill.insertEmbed(
                        cursorLocation,
                        'image',
                        downloadURL,
                      )
                      loading.value = false
                    },
                  )
                } else {
                  console.warn('You could only upload images.')
                }
              }
            },
          )

        // Set editor content
        if (props.value) {
          state.quill.pasteHTML(props.value)
        }

        // Mark model as touched if editor lost focus
        state.quill.on('selection-change', (range) => {
          if (!range) {
            context.emit('blur', state.quill)
          } else {
            context.emit('focus', state.quill)
          }
        })
        // Update model if text changes
        state.quill.on('text-change', () => {
          // diabled editor after content initialized
          if (props.disabled) {
            state.quill.enable(false)
          }
          let html = editor.value.children[0].innerHTML
          const quill = state.quill
          const text = state.quill.getText()
          if (html === '<p><br></p>') html = ''
          _content = html
          context.emit('update:value', _content)
          context.emit('change', { html, text, quill })
        })

        // Emit ready event
        context.emit('ready', state.quill)
      }
    }

    onBeforeUnmount(() => {
      const editorToolbar = editor.value.previousSibling
      if (editorToolbar && editorToolbar.className.indexOf('ql-toolbar') > -1) {
        editorToolbar.parentNode.removeChild(editorToolbar)
      }
    })

    onMounted(() => {
      initialize()
    })

    onUnmounted(() => {
      state.quill = null
    })

    return { editor, loading }
  },
}
</script>

<style lang="scss" scoped>
#editor {
  height: 60vh;
}
</style>
