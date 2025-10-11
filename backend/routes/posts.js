const express = require('express');
const Post = require('../models/Post');
const Community = require('../models/Community');
const { protect, checkCommunityMembership } = require('../middleware/auth');
const { validatePost, validateComment, validateObjectId } = require('../middleware/validation');
const { upload } = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// @desc    Get community posts
// @route   GET /api/communities/:communityId/posts
// @access  Private (Community members only)
const getCommunityPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { communityId } = req.params;

    const posts = await Post.find({ 
      community: communityId, 
      isActive: true 
    })
      .populate('author', 'firstName lastName avatar')
      .populate('comments.author', 'firstName lastName avatar')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments({ 
      community: communityId, 
      isActive: true 
    });

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new post
// @route   POST /api/communities/:communityId/posts
// @access  Private (Community members, or admin only for private communities)
const createPost = async (req, res, next) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const { title, content } = req.body;
    const { communityId } = req.params;
    const community = req.community; // Set by checkCommunityMembership middleware

    if (!title || !content) {
      console.log('Missing required fields:', { title, content });
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // For private communities, only admins can post
    if (community.type === 'private' && !community.isAdmin(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can post in private communities'
      });
    }

    // Handle file upload if exists
    let imageUrl = '';
    if (req.file) {
      console.log('Processing uploaded file:', req.file);
      try {
        // Ensure uploads directory exists
        const uploadDir = path.join(__dirname, '../../uploads/images');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // Move the file to the uploads directory
        const fileExt = path.extname(req.file.originalname);
        const fileName = `post-${Date.now()}${fileExt}`;
        const filePath = path.join(uploadDir, fileName);
        
        await fs.promises.rename(req.file.path, filePath);
        imageUrl = `/uploads/images/${fileName}`;
        console.log('File saved successfully:', imageUrl);
      } catch (fileError) {
        console.error('Error processing file upload:', fileError);
        return res.status(500).json({
          success: false,
          message: 'Error processing file upload',
          error: fileError.message
        });
      }
    }

    const postData = {
      title,
      content,
      images: imageUrl ? [imageUrl] : [],
      author: req.user._id,
      community: communityId
    };
    
    console.log('Creating post with data:', postData);
    
    const post = await Post.create(postData);
    await post.populate('author', 'firstName lastName avatar');

    console.log('Post created successfully:', post);
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Error in createPost:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
};

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Private (Community members only)
const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'firstName lastName avatar')
      .populate('comments.author', 'firstName lastName avatar')
      .populate('community', 'name type');

    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is member of the community
    const community = await Community.findById(post.community._id);
    const isMember = community.isMember(req.user._id);
    const isCreator = community.creator.toString() === req.user._id.toString();

    if (!isMember && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member to view this post'
      });
    }

    res.status(200).json({
      success: true,
      post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private (Author or community admin only)
const updatePost = async (req, res, next) => {
  try {
    const { title, content, images } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is author or community admin
    const community = await Community.findById(post.community);
    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = community.isAdmin(req.user._id);

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title: title || post.title,
        content: content || post.content,
        images: images || post.images
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('author', 'firstName lastName avatar');

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private (Author or community admin only)
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is author or community admin
    const community = await Community.findById(post.community);
    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = community.isAdmin(req.user._id);

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Soft delete
    post.isActive = false;
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/unlike post
// @route   POST /api/posts/:id/like
// @access  Private (Community members only)
const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is member of the community
    const community = await Community.findById(post.community);
    const isMember = community.isMember(req.user._id);
    const isCreator = community.creator.toString() === req.user._id.toString();

    if (!isMember && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member to like this post'
      });
    }

    const liked = post.toggleLike(req.user._id);
    await post.save();

    res.status(200).json({
      success: true,
      message: liked ? 'Post liked' : 'Post unliked',
      liked,
      likeCount: post.likeCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private (Community members only)
const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is member of the community
    const community = await Community.findById(post.community);
    const isMember = community.isMember(req.user._id);
    const isCreator = community.creator.toString() === req.user._id.toString();

    if (!isMember && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member to comment on this post'
      });
    }

    post.addComment(req.user._id, content);
    await post.save();

    await post.populate('comments.author', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: post.comments[post.comments.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update comment
// @route   PUT /api/posts/:id/comments/:commentId
// @access  Private (Comment author only)
const updateComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { id: postId, commentId } = req.params;

    const post = await Post.findById(postId);

    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is comment author
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }

    comment.content = content;
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      comment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private (Comment author or community admin only)
const deleteComment = async (req, res, next) => {
  try {
    const { id: postId, commentId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is comment author or community admin
    const community = await Community.findById(post.community);
    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isAdmin = community.isAdmin(req.user._id);

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    post.comments.pull(commentId);
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Routes
router.get('/communities/:communityId/posts', protect, checkCommunityMembership, getCommunityPosts);
router.post(
  '/communities/:communityId/posts',
  protect,
  checkCommunityMembership,
  upload.single('image'), // 'image' should match the field name in your frontend form data
  validatePost,
  createPost
);
router.get('/:id', protect, validateObjectId('id'), getPost);
router.put('/:id', protect, validateObjectId('id'), updatePost);
router.delete('/:id', protect, validateObjectId('id'), deletePost);
router.post('/:id/like', protect, validateObjectId('id'), toggleLike);
router.post('/:id/comments', protect, validateObjectId('id'), validateComment, addComment);
router.put('/:id/comments/:commentId', protect, validateObjectId('id'), updateComment);
router.delete('/:id/comments/:commentId', protect, validateObjectId('id'), deleteComment);

module.exports = router;
