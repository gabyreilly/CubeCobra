import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Button, Col, FormGroup, Input, Label, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';

import Query from 'utils/Query';

import AutocompleteInput from 'components/AutocompleteInput';
import CSRFForm from 'components/CSRFForm';
import DynamicFlash from 'components/DynamicFlash';

const UserAccountPage = ({ user, defaultNav }) => {
  const [nav, setNav] = useState(defaultNav);
  const [imageValue, setImageValue] = useState('');
  const [imageDict, setImageDict] = useState({});

  useEffect(() => {
    fetch('/cube/api/imagedict')
      .then((response) => response.json())
      .then((json) => setImageDict(json.dict));
  }, []);

  const handleClickNav = useCallback((event) => {
    event.preventDefault();
    setNav(event.target.getAttribute('data-nav'));
  }, []);

  const handleChangeImage = useCallback((event) => {
    setImageValue(event.target.value);
  }, []);

  const handleSubmitImage = useCallback((event) => {
    event.preventDefault();
  }, []);

  const result = imageDict[imageValue.toLowerCase()];
  let image;
  if (result) {
    image = {
      name: imageValue.replace(/ \[[^\]]*\]$/, ''),
      ...result,
    };
  } else {
    image = {
      name: user.image_name,
      uri: user.image,
      artist: user.artist,
    };
  }

  function isChecked(notificationTypeName) {
    return (
      !user.notification_silenced_types || user.notification_silenced_types.indexOf(notificationTypeName) < 0 // If no preferences, default all to true
    );
  }

  useEffect(() => {
    if (nav === 'profile') {
      Query.del('nav');
    } else {
      Query.set('nav', nav);
    }
  }, [nav]);

  return (
    <>
      <h2 className="mt-3">My Account </h2>
      <DynamicFlash />
      <Row>
        <Col xs={3}>
          <Nav vertical pills>
            <NavItem>
              <NavLink href="#" active={nav === 'profile'} data-nav="profile" onClick={handleClickNav}>
                Profile
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#" active={nav === 'password'} data-nav="password" onClick={handleClickNav}>
                Change Password
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#" active={nav === 'email'} data-nav="email" onClick={handleClickNav}>
                Update Email
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#" active={nav === 'notifications'} data-nav="notifications" onClick={handleClickNav}>
                Notifications
              </NavLink>
            </NavItem>
          </Nav>
        </Col>
        <Col xs={9}>
          <TabContent activeTab={nav}>
            <TabPane tabId="profile">
              <CSRFForm method="POST" action="/user/updateuserinfo">
                <div className="form-group">
                  <dl className="row">
                    <dt className="col-sm-3">Username</dt>
                    <dd className="col-sm-9">
                      <Input name="username" defaultValue={user.username} />
                    </dd>
                    <dt className="col-sm-3">Email</dt>
                    <dd className="col-sm-9">{user.email}</dd>
                    <dt className="col-sm-3">About</dt>
                    <dd className="col-sm-9">
                      <Input
                        type="textarea"
                        maxLength="2500"
                        placeholder="Describe yourself here... (max length 2500)"
                        name="body"
                        defaultValue={user.about}
                      />
                    </dd>
                    <dt className="col-sm-3">Profile Pic</dt>
                    <dd className="col-sm-9">
                      <Row>
                        <Col xs={6}>
                          <div className="position-relative">
                            <img width="100%" src={image.uri} alt={image.name} />
                            <em className="cube-preview-artist">Art by {image.artist}</em>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <AutocompleteInput
                            treeUrl="/cube/api/fullnames"
                            treePath="cardnames"
                            type="text"
                            className="mr-2"
                            name="remove"
                            value={imageValue}
                            onChange={handleChangeImage}
                            onSubmit={handleSubmitImage}
                            placeholder="Cardname for Image"
                            autoComplete="off"
                            data-lpignore
                          />
                          {result && <Input type="hidden" name="image" value={imageValue.toLowerCase()} />}
                        </Col>
                      </Row>
                    </dd>
                  </dl>
                  <Row noGutters>
                    <Button className="ml-auto" color="success" type="submit">
                      Update
                    </Button>
                  </Row>
                </div>
              </CSRFForm>
            </TabPane>
            <TabPane tabId="password">
              <CSRFForm method="POST" action="/user/resetpassword">
                <FormGroup row>
                  <Label for="password" className="col-sm-4 col-form-Label">
                    Old password:
                  </Label>
                  <Input className="col-sm-8" id="currentPassword" name="password" type="password" />
                </FormGroup>
                <FormGroup row>
                  <Label for="newPassword" className="col-sm-4 col-form-Label">
                    New Password:
                  </Label>
                  <Input className="col-sm-8" id="newPassword" name="password2" type="password" />
                </FormGroup>
                <FormGroup row>
                  <Label for="confirmPassword" className="col-sm-4 col-form-Label">
                    Confirm New Password:
                  </Label>
                  <Input className="col-sm-8" id="confirmPassword" name="password3" type="password" />
                </FormGroup>
                <Button color="success" type="submit">
                  Change Password
                </Button>
              </CSRFForm>
            </TabPane>
            <TabPane tabId="email">
              <CSRFForm method="POST" action="/user/updateemail">
                <FormGroup row>
                  <Label for="email" className="col-sm-4 col-form-Label">
                    New Email:
                  </Label>
                  <Input className="col-sm-8" id="email" name="email" type="email" defaultValue={user.email} />
                </FormGroup>
                <FormGroup row>
                  <Label for="emailPassword" className="col-sm-4 col-form-Label">
                    Password:
                  </Label>
                  <Input className="col-sm-8" id="emailPassword" name="password" type="password" />
                </FormGroup>
                <Button color="success" type="submit">
                  Update
                </Button>
              </CSRFForm>
            </TabPane>
            <TabPane tabId="notifications">
              <CSRFForm method="POST" action="/user/updatenotifications">
                <FormGroup row>
                  <h5>Choose which updates will show in your notification menu:</h5>
                </FormGroup>
                {/* 
                TODO this is upcoming with 1131
                <FormGroup row>
                  <FormGroup className="col-sm-8">
                    <Label>Updates and Blogs for cubes you follow</Label>
                  </FormGroup>
                  <FormGroup className="col-sm-2">
                    <Input
                      id="cube_updates_true"
                      name="cube_updates"
                      type="radio"
                      value="true"
                      defaultChecked={isChecked('cube_updates')}
                    />
                    <Label for="cube_updates_true">Yes </Label>
                  </FormGroup>
                  <FormGroup className="col-sm-2">
                    <Input
                      id="cube_updates_false"
                      name="cube_updates"
                      type="radio"
                      value="false"
                      defaultChecked={!isChecked('cube_updates')}
                    />
                    <Label for="cube_updates_false">No</Label>
                  </FormGroup>
                </FormGroup> */}
                <FormGroup row>
                  <FormGroup className="col-sm-8">
                    <Label>Drafts of cubes you own</Label>
                  </FormGroup>
                  <FormGroup className="col-sm-2">
                    <Input
                      id="cube_draft_own_true"
                      name="cube_draft_own"
                      type="radio"
                      value="true"
                      defaultChecked={isChecked('cube_draft_own')}
                    />
                    <Label for="own_cube_draft_true">Yes </Label>
                  </FormGroup>
                  <FormGroup className="col-sm-2">
                    <Input
                      id="cube_draft_own_false"
                      name="cube_draft_own"
                      type="radio"
                      value="false"
                      defaultChecked={!isChecked('cube_draft_own')}
                    />
                    <Label for="cube_draft_own_false">No</Label>
                  </FormGroup>
                </FormGroup>
                <FormGroup row>
                  <FormGroup className="col-sm-8">
                    <Label>Another user follows you</Label>
                  </FormGroup>
                  <FormGroup className="col-sm-2">
                    <Input
                      id="user_follow_true"
                      name="user_follow"
                      type="radio"
                      value="true"
                      defaultChecked={isChecked('user_follow')}
                    />
                    <Label for="user_follow_true">Yes </Label>
                  </FormGroup>
                  <FormGroup className="col-sm-2">
                    <Input
                      id="user_follow_false"
                      name="user_follow"
                      type="radio"
                      value="false"
                      defaultChecked={!isChecked('user_follow')}
                    />
                    <Label for="user_follow_false">No</Label>
                  </FormGroup>
                </FormGroup>
                <FormGroup row>
                  <FormGroup className="col-sm-8">
                    <Label>Comments on your blog, draft, or conversation</Label>
                  </FormGroup>
                  <FormGroup className="col-sm-2">
                    <Input
                      id="user_comment_true"
                      name="user_comment"
                      type="radio"
                      value="true"
                      defaultChecked={isChecked('user_comment')}
                    />
                    <Label for="user_comment_true">Yes </Label>
                  </FormGroup>
                  <FormGroup className="col-sm-2">
                    <Input
                      id="user_comment_false"
                      name="user_comment"
                      type="radio"
                      value="false"
                      defaultChecked={!isChecked('user_comment')}
                    />
                    <Label for="user_comment_false">No</Label>
                  </FormGroup>
                </FormGroup>
                <FormGroup row>
                  <FormGroup className="col-sm-8">
                    <Label>Clones of one of your cubes</Label>
                  </FormGroup>
                  <FormGroup className="col-sm-2">
                    <Input
                      id="cube_clone_true"
                      name="cube_clone"
                      type="radio"
                      value="true"
                      defaultChecked={isChecked('cube_clone')}
                    />
                    <Label for="cube_clone_true">Yes </Label>
                  </FormGroup>
                  <FormGroup className="col-sm-2">
                    <Input
                      id="cube_clone_false"
                      name="cube_clone"
                      type="radio"
                      value="false"
                      defaultChecked={!isChecked('cube_clone')}
                    />
                    <Label for="cube_clone_false">No</Label>
                  </FormGroup>
                </FormGroup>
                <Button color="success" type="submit">
                  Update
                </Button>
              </CSRFForm>
            </TabPane>
          </TabContent>
        </Col>
      </Row>
    </>
  );
};

UserAccountPage.propTypes = {
  user: PropTypes.shape({
    email: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    about: PropTypes.string.isRequired,
    image_name: PropTypes.string,
    image: PropTypes.string,
    artist: PropTypes.string,
    users_following: PropTypes.arrayOf(PropTypes.shape({}).isRequired),
    notification_silenced_types: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  defaultNav: PropTypes.string.isRequired,
};

export default UserAccountPage;
