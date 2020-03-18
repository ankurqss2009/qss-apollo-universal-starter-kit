import React, { useState } from 'react';
import { graphql } from 'react-apollo';
import update from 'immutability-helper';
import { compose } from '@gqlapp/core-common';
import PropTypes from 'prop-types';

import UPLOAD_FILES from '@gqlapp/post-client-react/graphql/AddPicture.graphql';
import REMOVE_FILE from '@gqlapp/upload-client-react/graphql/RemoveFile.graphql';
import POST_QUERY from '../graphql/PostQuery.graphql';

import PictureView from '../components/PictureView.web';

const onAddPicture = (prev, node) => {
  // ignore if duplicate
  if (prev.post.pictures.some(picture => picture.id === node.id)) {
    return prev;
  }

  const filteredPictures = prev.post.pictures.filter(picture => picture.id);
  return update(prev, {
    post: {
      pictures: {
        $set: [...filteredPictures, node]
      }
    }
  });
};

const onDeletePicture = (prev, id) => {
  const filteredPictures = prev.post.pictures.filter(picture => picture.id !== id);
  return update(prev, {
    post: {
      pictures: {
        $set: [...filteredPictures]
      }
    }
  });
};

const getPostFromCache = (cache, postId) =>
  cache.readQuery({
    query: POST_QUERY,
    variables: {
      id: postId
    }
  });

const writeFileToCache = (cache, post, postId) =>
  cache.writeQuery({
    query: POST_QUERY,
    variables: {
      ids: postId
    },
    data: {
      post: {
        ...post,
        __typename: 'Post'
      }
    }
  });

const Picture = props => {
  const { addPicture, removeFile, postId, handlePictureChange } = props;
  const [error, setError] = useState(null);

  const handleUploadFiles = async files => {
    try {
      const response = await addPicture(files, postId);
      if (!postId) {
        handlePictureChange(response, 'add');
      }
    } catch (e) {
      setError({ error: e.message });
    }
  };

  const handleRemoveFile = async id => {
    try {
      await removeFile(id, postId);
      if (id && !postId) {
        handlePictureChange(id, 'remove');
      }
    } catch (e) {
      setError({ error: e.message });
    }
  };

  return (
    <PictureView {...props} error={error} handleRemoveFile={handleRemoveFile} handleUploadFiles={handleUploadFiles} />
  );
};

Picture.propTypes = {
  removeFile: PropTypes.array,
  handlePictureChange: PropTypes.func,
  addPicture: PropTypes.array,
  postId: PropTypes.any
};

export default compose(
  graphql(UPLOAD_FILES, {
    props: ({ mutate }) => ({
      addPicture: async (files, postId) => {
        const {
          data: { uploadFiles }
        } = await mutate({
          variables: { files },
          optimisticResponse: {
            __typename: 'Mutation',
            uploadFiles: files[0]
          },
          update: (cache, { data: { uploadFiles } }) => {
            if (uploadFiles['id'] && postId) {
              const prevPost = getPostFromCache(cache, postId);
              if (prevPost.post) {
                const { post } = onAddPicture(prevPost, uploadFiles);
                writeFileToCache(cache, post, postId);
              }
            }
          }
        });
        return uploadFiles;
      }
    })
  }),
  graphql(REMOVE_FILE, {
    props: ({ mutate }) => ({
      removeFile: async (id, postId) => {
        const {
          data: { removeFile }
        } = await mutate({
          variables: { id },
          optimisticResponse: {
            __typename: 'Mutation',
            removeFile: {
              removeFile: true,
              __typename: 'File'
            }
          },
          update: cache => {
            if (id && postId) {
              const prevPost = getPostFromCache(cache, postId);
              if (prevPost.post) {
                const { post } = onDeletePicture(prevPost, id);
                writeFileToCache(cache, post, postId);
              }
            }
          }
        });
        return removeFile;
      }
    })
  })
)(Picture);
