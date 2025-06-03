<?php get_header(); ?>
<main class="container mx-auto py-12">
    <article class="prose lg:prose-xl mx-auto">
        <h1 class="text-4xl font-bold mb-6"><?php the_title(); ?></h1>
        <?php
        if (have_posts()) :
            while (have_posts()) : the_post();
                the_content();
            endwhile;
        endif;
        ?>
    </article>
</main>
<?php get_footer(); ?> 