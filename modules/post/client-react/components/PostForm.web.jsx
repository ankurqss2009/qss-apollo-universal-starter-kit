import React from 'react';
import PropTypes from 'prop-types';
import { withFormik } from 'formik';
import { translate } from '@gqlapp/i18n-client-react';

import { FieldAdapter as Field } from '@gqlapp/forms-client-react';
import { required, validate } from '@gqlapp/validation-common-react';
import { Form, RenderField, Button, Col, Row } from '@gqlapp/look-client-react';

import Picture from '../containers/Picture.web';

const postFormSchema = {
  title: [required],
  content: [required]
};

const PostForm = props => {
  let { values, handleSubmit, submitting, t, setValues } = props;

  const handlePictureChange = (response, action) => {
    if (action == 'add') {
      values.pictures.push(response);
    } else {
      let filteredPictures = values.pictures.filter(picture => picture.id !== response);
      values.pictures = filteredPictures;
    }
    setValues(values);
  };

  return (
    <Form name="post" onSubmit={handleSubmit}>
      <Row>
        <Col xs={12}>
          <Field name="title" component={RenderField} type="text" label={t('post.field.title')} value={values.title} />
        </Col>
      </Row>
      <Row>
        <Col xs={12} style={{ marginBottom: '10px' }}>
          {t('post.field.content')}
        </Col>
      </Row>
      <Row style={{ marginBottom: 10 }}>
        <Col xs={4}>
          <div className="textWrap">
            <div>
              <Field name="content" component={RenderField} type="textarea" value={values.content} />
            </div>
          </div>
        </Col>
        <Col xs={8}>
          <div className="card">
            <div>
              <Picture {...props} handlePictureChange={handlePictureChange} />
            </div>
          </div>
        </Col>
      </Row>
      <Button color="primary" type="submit" disabled={submitting}>
        {t('post.btn.submit')}
      </Button>
    </Form>
  );
};

PostForm.propTypes = {
  handleSubmit: PropTypes.func,
  onSubmit: PropTypes.func,
  submitting: PropTypes.bool,
  values: PropTypes.object,
  post: PropTypes.object,
  t: PropTypes.func,
  setValues: PropTypes.func
};

const PostFormWithFormik = withFormik({
  mapPropsToValues: props => ({
    title: props.post && props.post.title,
    content: props.post && props.post.content,
    pictures: props.post ? props.post.pictures : []
  }),
  validate: values => validate(values, postFormSchema),
  handleSubmit(
    values,
    {
      props: { onSubmit }
    }
  ) {
    onSubmit(values);
  },
  enableReinitialize: true,
  displayName: 'PostForm' // helps with React DevTools
});

export default translate('post')(PostFormWithFormik(PostForm));
