<?php get_header(); ?>
<main class="container mx-auto py-16">
    <section class="text-center mb-12">
        <h1 class="text-5xl font-extrabold text-purple-700 mb-4"><?php the_title(); ?></h1>
        <div class="text-xl text-gray-700 mb-8">
            <?php the_content(); ?>
        </div>
    </section>
    <!-- Add more editable sections using ACF or Gutenberg blocks as needed -->
</main>
<?php get_footer(); ?> 